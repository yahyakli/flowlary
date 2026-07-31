import mongoose from "mongoose";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/mongoose", () => ({ default: vi.fn() }));
vi.mock("@/lib/db/models/Budget", () => ({
  Budget: {
    find: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

const { auth } = await import("@/lib/auth");
const connectDB = (await import("@/lib/db/mongoose")).default;
const { Budget } = await import("@/lib/db/models/Budget");
const { GET: listBudgets, POST: createBudget } = await import("./route");

const mockedAuth = vi.mocked(auth);
const mockedConnectDB = vi.mocked(connectDB);
const mockedBudget = vi.mocked(Budget);

const userId = "64f1234d8f4a2f12a3456789";
const budgetId = new mongoose.Types.ObjectId();
const budgetPayload = {
  _id: budgetId,
  userId,
  category: "Food",
  monthlyLimit: 500,
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  updatedAt: new Date("2026-07-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: userId } } as any);
  mockedConnectDB.mockResolvedValue(undefined as any);
});

describe("Budgets API routes", () => {
  it("returns a list of budgets for authenticated users", async () => {
    mockedBudget.find.mockImplementationOnce(() => ({
      sort: () => ({
        lean: async () => [budgetPayload],
      }),
    }) as any);

    const response = await listBudgets();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      budgets: [{ category: "Food", monthlyLimit: 500 }],
    });
  });

  it("returns 401 for unauthenticated users on GET", async () => {
    mockedAuth.mockResolvedValueOnce(null as any);

    const response = await listBudgets();
    expect(response.status).toBe(401);
  });

  it("returns validation errors when creating budget with invalid payload", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ category: "InvalidCategory", monthlyLimit: -10 }),
      headers: { "content-type": "application/json" },
    });

    const response = await createBudget(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Validation failed");
    expect(body.details).toBeDefined();
  });

  it("creates a budget successfully", async () => {
    mockedBudget.create.mockResolvedValueOnce(budgetPayload as any);

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ category: "Food", monthlyLimit: 500 }),
      headers: { "content-type": "application/json" },
    });

    const response = await createBudget(request);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      budget: { category: "Food", monthlyLimit: 500 },
    });
  });

  it("returns 409 when creating a duplicate budget", async () => {
    const duplicateError = Object.assign(new Error("Duplicate key"), {
      code: 11000,
    });
    mockedBudget.create.mockRejectedValueOnce(duplicateError);

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ category: "Food", monthlyLimit: 500 }),
      headers: { "content-type": "application/json" },
    });

    const response = await createBudget(request);
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body).toHaveProperty("error", "A budget for this category already exists");
  });
});