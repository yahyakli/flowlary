import mongoose from "mongoose";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/mongoose", () => ({ default: vi.fn() }));
vi.mock("@/lib/db/models/Goal", () => ({
  Goal: {
    find: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));
vi.mock("@/lib/ledger/goalActions", () => ({ recordGoalContribution: vi.fn() }));
vi.mock("@/lib/utils/rollover", () => ({ ensureGoalContributions: vi.fn() }));

const { auth } = await import("@/lib/auth");
const connectDB = (await import("@/lib/db/mongoose")).default;
const { Goal } = await import("@/lib/db/models/Goal");
const { recordGoalContribution } = await import("@/lib/ledger/goalActions");
const { ensureGoalContributions } = await import("@/lib/utils/rollover");
const { GET: listGoals, POST: createGoal } = await import("./route");
const { GET: getGoal, PATCH: updateGoal, DELETE: deleteGoal } = await import("./[id]/route");
const { POST: contributeGoal } = await import("./[id]/contribute/route");

const mockedAuth = vi.mocked(auth);
const mockedConnectDB = vi.mocked(connectDB);
const mockedGoal = vi.mocked(Goal);
const mockedRecordGoalContribution = vi.mocked(recordGoalContribution);
const mockedEnsureGoalContributions = vi.mocked(ensureGoalContributions);

const userId = "64f1234d8f4a2f12a3456789";
const goalId = new mongoose.Types.ObjectId();
const goalPayload = {
  _id: goalId,
  userId,
  name: "Vacation Fund",
  title: "Vacation Fund",
  targetAmount: 2000,
  currentSaved: 1500,
  savedAmount: 1500,
  deadline: new Date("2026-12-01T00:00:00.000Z"),
  monthlyContribution: 0,
  icon: "target",
  color: "#4f46e5",
  isCompleted: false,
  lastProcessedMonth: 7,
  lastProcessedYear: 2026,
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  updatedAt: new Date("2026-07-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: userId } } as any);
  mockedConnectDB.mockResolvedValue(undefined);
  mockedEnsureGoalContributions.mockResolvedValue(undefined);
});

describe("Goal API routes", () => {
  it("returns a list of goals for authenticated users", async () => {
    mockedGoal.find.mockImplementationOnce(() => ({
      sort: () => ({
        lean: async () => [goalPayload],
      }),
    }) as any);

    const response = await listGoals(new Request("https://example.com"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject([{ name: "Vacation Fund", currentSaved: 1500 }]);
  });

  it("creates a goal and returns it", async () => {
    mockedGoal.create.mockResolvedValueOnce(goalPayload);

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({
        name: "Vacation Fund",
        targetAmount: 2000,
        currentSaved: 1500,
        deadline: "2026-12-01T00:00:00.000Z",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await createGoal(request);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ name: "Vacation Fund", currentSaved: 1500 });
  });

  it("returns validation errors when creating goal with invalid payload", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ name: "", targetAmount: -100 }),
      headers: { "content-type": "application/json" },
    });

    const response = await createGoal(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Validation failed");
    expect(body.details).toBeDefined();
  });

  it("returns a single goal by id", async () => {
    mockedGoal.findOne.mockImplementationOnce(() => ({
      lean: async () => goalPayload,
    }) as any);

    const response = await getGoal(new Request("https://example.com"), {
      params: Promise.resolve({ id: goalId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ name: "Vacation Fund", currentSaved: 1500 });
  });

  it("returns validation errors when updating goal with invalid payload", async () => {
    const request = new Request("https://example.com", {
      method: "PATCH",
      body: JSON.stringify({ targetAmount: -100 }),
      headers: { "content-type": "application/json" },
    });

    const response = await updateGoal(request, {
      params: Promise.resolve({ id: goalId.toString() }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Validation failed");
    expect(body.details).toBeDefined();
  });

  it("updates a goal and returns the updated goal", async () => {
    mockedGoal.findOne.mockResolvedValueOnce({ ...goalPayload });
    mockedGoal.findOneAndUpdate.mockImplementationOnce(() => ({
      lean: async () => ({ ...goalPayload, name: "New Vacation" }),
    }) as any);

    const request = new Request("https://example.com", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Vacation" }),
      headers: { "content-type": "application/json" },
    });

    const response = await updateGoal(request, {
      params: Promise.resolve({ id: goalId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ name: "New Vacation" });
  });

  it("deletes a goal by id", async () => {
    mockedGoal.findOneAndDelete.mockResolvedValueOnce(goalPayload);

    const response = await deleteGoal(new Request("https://example.com"), {
      params: Promise.resolve({ id: goalId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "Goal deleted successfully" });
  });

  it("posts a goal contribution and returns the updated goal", async () => {
    mockedGoal.findOne.mockImplementationOnce(() => ({
      lean: async () => goalPayload,
    }) as any);
    mockedRecordGoalContribution.mockResolvedValueOnce({ ...goalPayload, currentSaved: 1600 });

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ amount: 100, note: "Monthly deposit" }),
      headers: { "content-type": "application/json" },
    });

    const response = await contributeGoal(request, {
      params: Promise.resolve({ id: goalId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ currentSaved: 1600 });
    expect(mockedRecordGoalContribution).toHaveBeenCalledWith(
      new mongoose.Types.ObjectId(userId),
      new mongoose.Types.ObjectId(goalId.toString()),
      100,
      "Monthly deposit"
    );
  });

  it("rejects over-contribution with a clear error", async () => {
    mockedGoal.findOne.mockImplementationOnce(() => ({
      lean: async () => goalPayload,
    }) as any);

    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ amount: 600 }),
      headers: { "content-type": "application/json" },
    });

    const response = await contributeGoal(request, {
      params: Promise.resolve({ id: goalId.toString() }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Over-contribution not allowed");
    expect(body.details).toContain("exceeds remaining goal amount");
  });
});
