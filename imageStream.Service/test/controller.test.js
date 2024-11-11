/* eslint-disable no-undef */
import {
  uploadSmallFile,
  uploadImage,
} from "../src/controllers/image.Controller";
import { optimizedUploadFile } from "../src/services/imageService";
import { uploadMultiPartStreamToStorage } from "../src/middlewares/imageUploader";
import { ErrorLogger } from "../src/utils/errorLogger.Utils";
import { FileItem } from "../src/database/models/fileItem.models";
import { toMB } from "../src/constants";

// Mock dependencies
jest.mock("../src/services/imageService");
jest.mock("../src/middlewares/imageUploader");
jest.mock("../src/utils/errorLogger.Utils");
jest.mock("../src/database/models/fileItem.models");

describe("Image Upload Controllers", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      file: null,
      files: null,
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("uploadSmallFile", () => {
    it("should return error if no file is provided", async () => {
      await uploadSmallFile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("No file found in the request"),
        })
      );
      expect(mockNext).not.toHaveBeenCalled(); // Ensure next is not called
    });

    it("should successfully upload a small file", async () => {
      mockReq.file = {
        buffer: Buffer.from("mock file content"),
        mimetype: "image/png",
        originalname: "mock-image.png",
        size: toMB,
      };

      // Mock successful upload and save
      optimizedUploadFile.mockResolvedValue({
        Url: "https://mockurl.com/mock-image.png",
      });

      const mockSavedFileItem = new FileItem({
        name: "mock-image.png",
        url: "https://mockurl.com/mock-image.png",
      });
      FileItem.prototype.save.mockResolvedValue(mockSavedFileItem);

      await uploadSmallFile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Image Uploaded Successfully",
        })
      );
      expect(mockNext).toHaveBeenCalled(); // Ensure next is called on success
    });

    it("should handle upload failures and log error", async () => {
      mockReq.file = {
        buffer: Buffer.from("mock file content"),
        mimetype: "image/png",
        originalname: "mock-image.png",
        size: toMB,
      };

      optimizedUploadFile.mockResolvedValue(null);

      await uploadSmallFile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to upload file",
        })
      );
      expect(ErrorLogger.error).toHaveBeenCalled(); // Check error logging
      expect(mockNext).not.toHaveBeenCalled(); // Ensure next is not called on failure
    });
  });

  describe("uploadImage", () => {
    it("should return error if no files are uploaded", async () => {
      await uploadImage(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No files uploaded.",
        })
      );
      expect(mockNext).not.toHaveBeenCalled(); // Ensure next is not called
    });

    it("should successfully upload multiple files", async () => {
      mockReq.files = [
        {
          originalname: "mock-image.png",
          size: toMB,
          mimetype: "image/png",
        },
      ];

      const mockFileItem = new FileItem({
        name: "mock-image.png",
      });

      uploadMultiPartStreamToStorage.mockResolvedValue({
        fileItem: mockFileItem,
      });

      await uploadImage(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Images Uploaded Successfully",
        })
      );
      expect(mockNext).toHaveBeenCalled(); // Ensure next is called on success
    });

    it("should handle upload failures and log error", async () => {
      mockReq.files = null; // Simulate no files uploaded

      await uploadImage(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No files uploaded.",
        })
      );
      expect(ErrorLogger.error).toHaveBeenCalled(); // Check error logging
      expect(mockNext).not.toHaveBeenCalled(); // Ensure next is not called on failure
    });
  });
});
