import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/models/Expense", () => ({
  Expense: {
    findOneAndUpdate: vi.fn(),
  },
}));
vi.mock("@/lib/storage/gridfs", () => ({
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  saveUpload: vi.fn(),
  isAllowedMimeType: vi.fn(),
}));

const { auth } = await import("@/lib/auth");
const { Expense } = await import("@/lib/db/models/Expense");
const { saveUpload, isAllowedMimeType } = await import("@/lib/storage/gridfs");
const { POST: uploadAttachment } = await import("./route");

const mockedAuth = vi.mocked(auth);
const mockedExpense = vi.mocked(Expense);
const mockedSaveUpload = vi.mocked(saveUpload);
const mockedIsAllowedMimeType = vi.mocked(isAllowedMimeType);

const userId = "64f1234d8f4a2f12a3456789";
const expenseId = "64f1234d8f4a2f12a3456789";

function createUploadRequest(
  file?: File,
  query: string = ""
): Request {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  return new Request(`https://example.com/api/expenses/attachment${query}`, {
    method: "POST",
    body: formData,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: userId } } as never);
  mockedIsAllowedMimeType.mockReturnValue(true);
  mockedSaveUpload.mockResolvedValue({
    id: "507f1f77bcf86cd799439011",
    url: `/api/files/507f1f77bcf86cd799439011`,
    filename: "receipt.png",
    contentType: "image/png",
    length: 1024,
  } as never);
});

describe("Expense attachment upload API", () => {
  it("returns 401 when unauthenticated", async () => {
    mockedAuth.mockResolvedValueOnce(null as never);
    const response = await uploadAttachment(createUploadRequest());
    expect(response.status).toBe(401);
  });

  it("returns 400 when no file is provided", async () => {
    const response = await uploadAttachment(createUploadRequest());
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error", "Invalid file upload");
  });

  it("returns 400 for an unsupported file type", async () => {
    mockedIsAllowedMimeType.mockReturnValueOnce(false);
    const file = new File(["data"], "document.txt", { type: "text/plain" });
    const response = await uploadAttachment(createUploadRequest(file));
    expect(response.status).toBe(400);
  });

  it("uploads a valid file and returns the attachmentUrl", async () => {
    const file = new File(["data"], "receipt.png", { type: "image/png" });
    const response = await uploadAttachment(createUploadRequest(file));
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({
      attachmentUrl: "/api/files/507f1f77bcf86cd799439011",
      filename: "receipt.png",
      contentType: "image/png",
      length: 1024,
    });
    expect(mockedSaveUpload).toHaveBeenCalledWith({
      userId,
      filename: "receipt.png",
      contentType: "image/png",
      buffer: expect.any(Buffer),
    });
  });

  it("attaches the file to an expense when expenseId is provided", async () => {
    mockedExpense.findOneAndUpdate.mockImplementationOnce(() => ({
      lean: async () => ({
        _id: expenseId,
        attachmentUrl: "/api/files/507f1f77bcf86cd799439011",
      }),
    }) as never);

    const file = new File(["data"], "receipt.png", { type: "image/png" });
    const response = await uploadAttachment(
      createUploadRequest(file, `?expenseId=${expenseId}`)
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.attachmentUrl).toBe("/api/files/507f1f77bcf86cd799439011");
    expect(body.expense).toHaveProperty("_id", expenseId);
    expect(mockedExpense.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: expenseId, userId },
      { $set: { attachmentUrl: "/api/files/507f1f77bcf86cd799439011" } },
      { new: true }
    );
  });

  it("returns 404 when the expense is not found", async () => {
    mockedExpense.findOneAndUpdate.mockImplementationOnce(() => ({
      lean: async () => null,
    }) as never);

    const file = new File(["data"], "receipt.png", { type: "image/png" });
    const response = await uploadAttachment(
      createUploadRequest(file, `?expenseId=${expenseId}`)
    );
    expect(response.status).toBe(404);
  });
});