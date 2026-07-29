import mongoose from "mongoose";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/mongoose", () => ({ default: vi.fn() }));
vi.mock("@/lib/db/models/Debt", () => ({
  Debt: {
    find: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));
vi.mock("@/lib/ledger/debtActions", () => ({ recordDebtPayment: vi.fn() }));

const { auth } = await import("@/lib/auth");
const connectDB = (await import("@/lib/db/mongoose")).default;
const { Debt } = await import("@/lib/db/models/Debt");
const { recordDebtPayment } = await import("@/lib/ledger/debtActions");
const { GET: listDebts, POST: createDebt } = await import("./route");
const {
  GET: getDebt,
  PATCH: updateDebt,
  DELETE: deleteDebt,
} = await import("./[id]/route");
const { POST: payDebt } = await import("./[id]/pay/route");

const mockedAuth = vi.mocked(auth);
const mockedConnectDB = vi.mocked(connectDB);
const mockedDebt = vi.mocked(Debt);
const mockedRecordDebtPayment = vi.mocked(recordDebtPayment);

const userId = "64f1234d8f4a2f12a3456789";
const debtId = new mongoose.Types.ObjectId();
const debtPayload = {
  _id: debtId,
  userId,
  title: "Student Loan",
  totalAmount: 1000,
  remainingAmount: 500,
  monthlyPayment: 100,
  interestRate: 5,
  dueDay: 15,
  lender: "Bank",
  isCompleted: false,
  name: "Student Loan",
  originalAmount: 1000,
  currentBalance: 500,
  interestPercent: 5,
  minPayment: 100,
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  updatedAt: new Date("2026-07-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: userId } } as any);
  mockedConnectDB.mockResolvedValue(undefined);
});

describe("Debt API routes", () => {
  it("returns a list of debts for authenticated users", async () => {
    mockedDebt.find.mockImplementationOnce(() => ({
      sort: () => ({
        lean: async () => [debtPayload],
      }),
    }) as any);

    const response = await listDebts();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ debts: [{ title: "Student Loan", currentBalance: 500 }] });
  });

  it("creates a debt and returns it", async () => {
    mockedDebt.create.mockResolvedValueOnce(debtPayload);

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({
        title: "Student Loan",
        totalAmount: 1000,
        remainingAmount: 500,
        monthlyPayment: 100,
        interestRate: 5,
        dueDay: 15,
        lender: "Bank",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await createDebt(request);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ debt: { title: "Student Loan", currentBalance: 500 } });
  });

  it("returns validation errors when creating debt with invalid payload", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ title: "", totalAmount: -10 }),
      headers: { "content-type": "application/json" },
    });

    const response = await createDebt(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Validation failed");
    expect(body.details).toBeDefined();
  });

  it("returns a single debt by id", async () => {
    mockedDebt.findOne.mockImplementationOnce(() => ({
      lean: async () => debtPayload,
    }) as any);

    const response = await getDebt(new Request("https://example.com"), {
      params: Promise.resolve({ id: debtId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ debt: { title: "Student Loan", currentBalance: 500 } });
  });

  it("returns validation errors when updating debt with currentBalance field", async () => {
    const request = new Request("https://example.com", {
      method: "PATCH",
      body: JSON.stringify({ currentBalance: 100 }),
      headers: { "content-type": "application/json" },
    });

    const response = await updateDebt(request, {
      params: Promise.resolve({ id: debtId.toString() }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Direct currentBalance updates are not allowed");
    expect(body.details).toBeDefined();
  });

  it("updates a debt without changing currentBalance", async () => {
    mockedDebt.findOne.mockResolvedValueOnce({ ...debtPayload, currentBalance: 500 });
    mockedDebt.findOneAndUpdate.mockImplementationOnce(() => ({
      lean: async () => ({ ...debtPayload, lender: "New Bank" }),
    }) as any);

    const request = new Request("https://example.com", {
      method: "PATCH",
      body: JSON.stringify({ lender: "New Bank" }),
      headers: { "content-type": "application/json" },
    });

    const response = await updateDebt(request, {
      params: Promise.resolve({ id: debtId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ debt: { lender: "New Bank" } });
  });

  it("deletes a debt by id", async () => {
    mockedDebt.findOneAndDelete.mockResolvedValueOnce(debtPayload);

    const response = await deleteDebt(new Request("https://example.com"), {
      params: Promise.resolve({ id: debtId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "Debt deleted successfully" });
  });

  it("posts a debt payment and returns the updated debt", async () => {
    mockedDebt.findOne.mockImplementationOnce(() => ({
      lean: async () => debtPayload,
    }) as any);
    mockedRecordDebtPayment.mockResolvedValueOnce({ ...debtPayload, currentBalance: 400 });

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ amount: 100, note: "Monthly payment" }),
      headers: { "content-type": "application/json" },
    });

    const response = await payDebt(request, {
      params: Promise.resolve({ id: debtId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ debt: { currentBalance: 400 } });
    expect(mockedRecordDebtPayment).toHaveBeenCalledWith(
      new mongoose.Types.ObjectId(userId),
      new mongoose.Types.ObjectId(debtId.toString()),
      100,
      "Monthly payment"
    );
  });

  it("rejects an overpayment with a clear error", async () => {
    mockedDebt.findOne.mockImplementationOnce(() => ({
      lean: async () => debtPayload,
    }) as any);

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ amount: 600 }),
      headers: { "content-type": "application/json" },
    });

    const response = await payDebt(request, {
      params: Promise.resolve({ id: debtId.toString() }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Overpayment not allowed");
    expect(body.details).toContain("exceeds current balance");
  });
});
