import mongoose from "mongoose";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/mongoose", () => ({ default: vi.fn() }));
vi.mock("@/lib/db/models/Income", () => ({
  Income: {
    find: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    deleteOne: vi.fn(),
  },
}));
vi.mock("@/lib/ledger/postEntry", () => ({ postLedgerEntry: vi.fn() }));

const { GET: listIncomes, POST: createIncome } = await import("./route");
const { GET: getIncome, PATCH: updateIncome, DELETE: deleteIncome } = await import("./[id]/route");
const { auth } = await import("@/lib/auth");
const connectDB = (await import("@/lib/db/mongoose")).default;
const { Income } = await import("@/lib/db/models/Income");
const { postLedgerEntry } = await import("@/lib/ledger/postEntry");

const mockedAuth = vi.mocked(auth);
const mockedConnectDB = vi.mocked(connectDB);
const mockedIncome = vi.mocked(Income);
const mockedPostLedgerEntry = vi.mocked(postLedgerEntry);

const userId = "64f1234d8f4a2f12a3456789";
const incomeId = new mongoose.Types.ObjectId();
const incomePayload = {
  _id: incomeId,
  userId,
  source: "Salary",
  amount: 1200,
  notes: "Monthly payment",
  date: new Date("2026-07-01T00:00:00.000Z"),
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  updatedAt: new Date("2026-07-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: userId } } as any);
  mockedConnectDB.mockResolvedValue(undefined);
});

describe("Income API routes", () => {
  it("returns a list of incomes for authenticated users", async () => {
    mockedIncome.find.mockImplementationOnce(() => ({
      sort: () => ({
        lean: async () => [incomePayload],
      }),
    }) as any);

    const response = await listIncomes();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ incomes: [{ source: "Salary", amount: 1200 }] });
  });

  it("returns validation errors when creating income with invalid payload", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ source: "", amount: 0 }),
      headers: { "content-type": "application/json" },
    });

    const response = await createIncome(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Validation failed");
    expect(body.details).toBeDefined();
  });

  it("creates income and posts a ledger entry", async () => {
    mockedIncome.create.mockResolvedValueOnce(incomePayload);
    mockedPostLedgerEntry.mockResolvedValueOnce({} as any);

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({
        source: "Salary",
        amount: 1200,
        date: "2026-07-01T00:00:00.000Z",
        notes: "Monthly payment",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await createIncome(request);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ income: { source: "Salary", amount: 1200, notes: "Monthly payment" } });
    expect(mockedPostLedgerEntry).toHaveBeenCalledWith(
      new mongoose.Types.ObjectId(userId),
      expect.objectContaining({ type: "income", amountIn: 1200 })
    );
  });

  it("returns a single income by id", async () => {
    mockedIncome.findOne.mockImplementationOnce(() => ({
      lean: async () => incomePayload,
    }) as any);

    const response = await getIncome(new Request("https://example.com"), {
      params: Promise.resolve({ id: incomeId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ income: { source: "Salary", amount: 1200 } });
  });

  it("returns validation errors when updating income with invalid payload", async () => {
    const request = new Request("https://example.com", {
      method: "PATCH",
      body: JSON.stringify({ amount: -10 }),
      headers: { "content-type": "application/json" },
    });

    const response = await updateIncome(request, {
      params: Promise.resolve({ id: incomeId.toString() }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Validation failed");
    expect(body.details).toBeDefined();
  });

  it("deletes an income by id", async () => {
    mockedIncome.findOneAndDelete.mockResolvedValueOnce(incomePayload);

    const response = await deleteIncome(new Request("https://example.com"), {
      params: Promise.resolve({ id: incomeId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "Income deleted successfully" });
  });
});
