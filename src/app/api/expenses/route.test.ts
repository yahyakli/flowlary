import mongoose from "mongoose";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/mongoose", () => ({ default: vi.fn() }));
vi.mock("@/lib/db/models/Expense", () => ({
  Expense: {
    find: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    deleteOne: vi.fn(),
  },
}));
vi.mock("@/lib/ledger/postEntry", () => ({ postLedgerEntry: vi.fn() }));

const { auth } = await import("@/lib/auth");
const connectDB = (await import("@/lib/db/mongoose")).default;
const { Expense } = await import("@/lib/db/models/Expense");
const { postLedgerEntry } = await import("@/lib/ledger/postEntry");
const { GET: listExpenses, POST: createExpense } = await import("./route");
const { GET: getExpense, PATCH: updateExpense, DELETE: deleteExpense } = await import("./[id]/route");

const mockedAuth = vi.mocked(auth);
const mockedConnectDB = vi.mocked(connectDB);
const mockedExpense = vi.mocked(Expense);
const mockedPostLedgerEntry = vi.mocked(postLedgerEntry);

const userId = "64f1234d8f4a2f12a3456789";
const expenseId = new mongoose.Types.ObjectId();
const expensePayload = {
  _id: expenseId,
  userId,
  date: new Date("2026-07-01T00:00:00.000Z"),
  category: "Food",
  description: "Groceries",
  amount: 85.5,
  notes: "Weekly shopping",
  title: "Groceries",
  type: "variable",
  isRecurring: false,
  month: 7,
  year: 2026,
  tags: [],
  note: "Weekly shopping",
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  updatedAt: new Date("2026-07-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: userId } } as any);
  mockedConnectDB.mockResolvedValue(undefined);
});

describe("Expenses API routes", () => {
  it("returns a list of expenses for authenticated users", async () => {
    mockedExpense.find.mockImplementationOnce(() => ({
      sort: () => ({
        lean: async () => [expensePayload],
      }),
    }) as any);

    const response = await listExpenses();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ expenses: [{ category: "Food", amount: 85.5 }] });
  });

  it("returns validation errors when creating expense with invalid payload", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ category: "", amount: -1, description: "" }),
      headers: { "content-type": "application/json" },
    });

    const response = await createExpense(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Validation failed");
    expect(body.details).toBeDefined();
  });

  it("creates expense and posts a ledger entry", async () => {
    mockedExpense.create.mockResolvedValueOnce(expensePayload);
    mockedPostLedgerEntry.mockResolvedValueOnce({} as any);

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({
        date: "2026-07-01T00:00:00.000Z",
        category: "Food",
        description: "Groceries",
        amount: 85.5,
        notes: "Weekly shopping",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await createExpense(request);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ expense: { category: "Food", amount: 85.5 } });
    expect(mockedPostLedgerEntry).toHaveBeenCalledWith(
      new mongoose.Types.ObjectId(userId),
      expect.objectContaining({ type: "expense", amountOut: 85.5, category: "Food" })
    );
  });

  it("returns a single expense by id", async () => {
    mockedExpense.findOne.mockImplementationOnce(() => ({
      lean: async () => expensePayload,
    }) as any);

    const response = await getExpense(new Request("https://example.com"), {
      params: Promise.resolve({ id: expenseId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ expense: { category: "Food", amount: 85.5 } });
  });

  it("returns validation errors when updating expense with invalid payload", async () => {
    const request = new Request("https://example.com", {
      method: "PATCH",
      body: JSON.stringify({ amount: -10 }),
      headers: { "content-type": "application/json" },
    });

    const response = await updateExpense(request, {
      params: Promise.resolve({ id: expenseId.toString() }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Validation failed");
    expect(body.details).toBeDefined();
  });

  it("deletes an expense by id", async () => {
    mockedExpense.findOneAndDelete.mockResolvedValueOnce(expensePayload);

    const response = await deleteExpense(new Request("https://example.com"), {
      params: Promise.resolve({ id: expenseId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "Expense deleted successfully" });
  });
});
