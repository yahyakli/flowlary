import { describe, it, expect, beforeEach, vi } from "vitest";
import * as XLSX from "xlsx";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/ledger/incomeActions", () => ({ createIncomeEntry: vi.fn() }));
vi.mock("@/lib/ledger/expenseActions", () => ({ createExpenseEntry: vi.fn() }));

const { auth } = await import("@/lib/auth");
const { createIncomeEntry } = await import("@/lib/ledger/incomeActions");
const { createExpenseEntry } = await import("@/lib/ledger/expenseActions");
const { POST: importSpreadsheet } = await import("./route");

const mockedAuth = vi.mocked(auth);
const mockedCreateIncomeEntry = vi.mocked(createIncomeEntry);
const mockedCreateExpenseEntry = vi.mocked(createExpenseEntry);

const userId = "64f1234d8f4a2f12a3456789";

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: userId } } as never);
  mockedCreateIncomeEntry.mockResolvedValue({} as never);
  mockedCreateExpenseEntry.mockResolvedValue({} as never);
});

function createSampleWorkbook(): Buffer {
  const incomeData = [
    { Date: "2026-07-01", Month: "July", Source: "Salary", Amount: 1200, Notes: "Monthly payment" },
    { Date: "2026-07-15", Month: "July", Source: "Freelance", Amount: 300, Notes: "Side project" },
    { Date: "2026-07-20", Month: "July", Source: "", Amount: -50, Notes: "Bad row" },
  ];
  const expenseData = [
    { Date: "2026-07-01", Month: "July", Category: "Food", Description: "Groceries", Amount: 50, Notes: "Weekly groceries" },
    { Date: "2026-07-05", Month: "July", Category: "Transport", Description: "Gas", Amount: 30, Notes: "" },
    { Date: "2026-07-10", Month: "July", Category: "InvalidCategory", Description: "Test", Amount: 100, Notes: "" },
  ];

  const incomeSheet = XLSX.utils.json_to_sheet(incomeData);
  const expenseSheet = XLSX.utils.json_to_sheet(expenseData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, incomeSheet, "Income");
  XLSX.utils.book_append_sheet(workbook, expenseSheet, "Expenses");

  return Buffer.from(XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as Uint8Array);
}

function createWorkbookWithNoSheets(): Buffer {
  const workbook = XLSX.utils.book_new();
  const dummySheet = XLSX.utils.json_to_sheet([{ A: 1 }]);
  XLSX.utils.book_append_sheet(workbook, dummySheet, "Sheet1");
  return Buffer.from(XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as Uint8Array);
}

function createRequestWithFile(data: Buffer): Request {
  const file = new File([data as unknown as BlobPart], "sample.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const formData = new FormData();
  formData.append("file", file);
  return new Request("https://example.com", { method: "POST", body: formData });
}

interface RowResult {
  row: number;
  status: "success" | "failed";
  data?: Record<string, unknown>;
  error?: string;
}

describe("Import API route", () => {
  it("returns 401 for unauthenticated users", async () => {
    mockedAuth.mockResolvedValueOnce(null as never);

    const buffer = createSampleWorkbook();
    const request = createRequestWithFile(buffer);

    const response = await importSpreadsheet(request);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });

  it("returns 400 when no file is uploaded", async () => {
    const formData = new FormData();
    const request = new Request("https://example.com", {
      method: "POST",
      body: formData,
    });

    const response = await importSpreadsheet(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "No file uploaded. Please provide a spreadsheet file.");
  });

  it("returns 400 when no Income or Expenses sheet is found", async () => {
    const buffer = createWorkbookWithNoSheets();
    const request = createRequestWithFile(buffer);

    const response = await importSpreadsheet(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('No "Income" or "Expenses" sheet found');
  });

  it("imports valid rows and reports per-row success/failure summary", async () => {
    const buffer = createSampleWorkbook();
    const request = createRequestWithFile(buffer);

    const response = await importSpreadsheet(request);
    expect(response.status).toBe(200);
    const body = await response.json();

    // Income: 2 valid, 1 invalid (empty source + negative amount)
    expect(body.summary.income).toEqual({ total: 3, succeeded: 2, failed: 1 });
    // Expenses: 2 valid, 1 invalid (bad category)
    expect(body.summary.expenses).toEqual({ total: 3, succeeded: 2, failed: 1 });

    // Check income results
    expect(body.results.income).toHaveLength(3);
    expect(body.results.income[0]).toMatchObject({
      row: 2,
      status: "success",
      data: { source: "Salary", amount: 1200 },
    });
    expect(body.results.income[1]).toMatchObject({
      row: 3,
      status: "success",
      data: { source: "Freelance", amount: 300 },
    });
    expect(body.results.income[2]).toMatchObject({
      row: 4,
      status: "failed",
    });
    expect(body.results.income[2].error).toBeDefined();

    // Check expense results
    expect(body.results.expenses).toHaveLength(3);
    expect(body.results.expenses[0]).toMatchObject({
      row: 2,
      status: "success",
      data: { category: "Food", description: "Groceries", amount: 50 },
    });
    expect(body.results.expenses[1]).toMatchObject({
      row: 3,
      status: "success",
      data: { category: "Transport", description: "Gas", amount: 30 },
    });
    expect(body.results.expenses[2]).toMatchObject({
      row: 4,
      status: "failed",
    });
    expect(body.results.expenses[2].error).toBeDefined();

    // Verify service functions were called for valid rows
    expect(mockedCreateIncomeEntry).toHaveBeenCalledTimes(2);
    expect(mockedCreateExpenseEntry).toHaveBeenCalledTimes(2);
  });

  it("reports per-row failure when createIncomeEntry throws", async () => {
    mockedCreateIncomeEntry.mockReset();
    mockedCreateIncomeEntry
      .mockResolvedValueOnce({} as never)
      .mockRejectedValueOnce(new Error("Database connection failed"));

    const buffer = createSampleWorkbook();
    const request = createRequestWithFile(buffer);

    const response = await importSpreadsheet(request);
    expect(response.status).toBe(200);
    const body = await response.json();

    // 1 success, 1 failed from service error, 1 failed from validation
    expect(body.summary.income).toEqual({ total: 3, succeeded: 1, failed: 2 });

    const failedRow = (body.results.income as RowResult[]).find(
      (r) => r.status === "failed" && r.error === "Database connection failed"
    );
    expect(failedRow).toBeDefined();
  });

  it("reports per-row failure when createExpenseEntry throws", async () => {
    mockedCreateExpenseEntry.mockReset();
    mockedCreateExpenseEntry
      .mockResolvedValueOnce({} as never)
      .mockRejectedValueOnce(new Error("Ledger posting failed"));

    const buffer = createSampleWorkbook();
    const request = createRequestWithFile(buffer);

    const response = await importSpreadsheet(request);
    expect(response.status).toBe(200);
    const body = await response.json();

    // 1 success, 1 failed from service error, 1 failed from validation
    expect(body.summary.expenses).toEqual({ total: 3, succeeded: 1, failed: 2 });

    const failedRow = (body.results.expenses as RowResult[]).find(
      (r) => r.status === "failed" && r.error === "Ledger posting failed"
    );
    expect(failedRow).toBeDefined();
  });
});