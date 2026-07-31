import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createIncomeEntry } from "@/lib/ledger/incomeActions";
import { createExpenseEntry } from "@/lib/ledger/expenseActions";
import { incomeSchema } from "@/lib/validations/income.schema";
import { expenseSchema } from "@/lib/validations/expense.schema";
import * as XLSX from "xlsx";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
}

interface RowResult {
  row: number;
  status: "success" | "failed";
  data?: Record<string, unknown>;
  error?: string;
}

interface SheetSummary {
  total: number;
  succeeded: number;
  failed: number;
}

interface ImportResponse {
  summary: {
    income: SheetSummary;
    expenses: SheetSummary;
  };
  results: {
    income: RowResult[];
    expenses: RowResult[];
  };
}

/**
 * Normalizes spreadsheet row keys to lowercase so they match Zod schema field names.
 * Spreadsheet headers like "Date", "Source", "Amount" become "date", "source", "amount".
 */
function normalizeRowKeys(row: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    normalized[key.charAt(0).toLowerCase() + key.slice(1)] = row[key];
  }
  return normalized;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded. Please provide a spreadsheet file." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    const incomeSheet = workbook.Sheets["Income"];
    const expensesSheet = workbook.Sheets["Expenses"];

    if (!incomeSheet && !expensesSheet) {
      return NextResponse.json(
        {
          error:
            'No "Income" or "Expenses" sheet found. Please ensure the spreadsheet has sheets named "Income" and "Expenses".',
        },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    const incomeRows: Record<string, unknown>[] = incomeSheet
      ? XLSX.utils.sheet_to_json(incomeSheet).map(normalizeRowKeys)
      : [];
    const expenseRows: Record<string, unknown>[] = expensesSheet
      ? XLSX.utils.sheet_to_json(expensesSheet).map(normalizeRowKeys)
      : [];

    const incomeResults: RowResult[] = [];
    let incomeSucceeded = 0;
    let incomeFailed = 0;

    for (let i = 0; i < incomeRows.length; i++) {
      const rowNumber = i + 2;
      const row = incomeRows[i];

      const parsed = incomeSchema.safeParse(row);

      if (!parsed.success) {
        const errorMessage = parsed.error.issues
          .map((issue) => issue.message)
          .join("; ");
        incomeResults.push({ row: rowNumber, status: "failed", error: errorMessage });
        incomeFailed++;
        continue;
      }

      try {
        await createIncomeEntry(userId, parsed.data);
        incomeResults.push({
          row: rowNumber,
          status: "success",
          data: { source: parsed.data.source, amount: parsed.data.amount },
        });
        incomeSucceeded++;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        incomeResults.push({ row: rowNumber, status: "failed", error: message });
        incomeFailed++;
      }
    }

    const expenseResults: RowResult[] = [];
    let expenseSucceeded = 0;
    let expenseFailed = 0;

    for (let i = 0; i < expenseRows.length; i++) {
      const rowNumber = i + 2;
      const row = expenseRows[i];

      const parsed = expenseSchema.safeParse(row);

      if (!parsed.success) {
        const errorMessage = parsed.error.issues
          .map((issue) => issue.message)
          .join("; ");
        expenseResults.push({ row: rowNumber, status: "failed", error: errorMessage });
        expenseFailed++;
        continue;
      }

      try {
        await createExpenseEntry(userId, parsed.data);
        expenseResults.push({
          row: rowNumber,
          status: "success",
          data: {
            category: parsed.data.category,
            description: parsed.data.description,
            amount: parsed.data.amount,
          },
        });
        expenseSucceeded++;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        expenseResults.push({ row: rowNumber, status: "failed", error: message });
        expenseFailed++;
      }
    }

    const response: ImportResponse = {
      summary: {
        income: {
          total: incomeRows.length,
          succeeded: incomeSucceeded,
          failed: incomeFailed,
        },
        expenses: {
          total: expenseRows.length,
          succeeded: expenseSucceeded,
          failed: expenseFailed,
        },
      },
      results: {
        income: incomeResults,
        expenses: expenseResults,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return serverErrorResponse(error);
  }
}