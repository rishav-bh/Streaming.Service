/* eslint-disable no-undef */
import { ErrorLogger } from "../src/utils/errorLogger.Utils";

jest.mock("../src/utils/errorLogger.Utils");

describe("Image Upload Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      files: [],
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  it("should call next if files are present", async () => {
    mockReq.files = [{ originalname: "mock-image.png" }];

    await uploadMultiPartStreamToStorage(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it("should return error if no files are present", async () => {
    await uploadMultiPartStreamToStorage(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "No files uploaded.",
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should log an error if an exception occurs", async () => {
    mockReq.files = [{ originalname: "mock-image.png" }];
    ErrorLogger.error.mockImplementation(() => {
      throw new Error("Logging error");
    });

    await uploadMultiPartStreamToStorage(mockReq, mockRes, mockNext);

    expect(ErrorLogger.error).toHaveBeenCalled();
  });
});
