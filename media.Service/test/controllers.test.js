/* eslint-disable no-undef */
import {
  kisanBytes,
  getMediaById,
  kisanBytesActivities,
  getCommentsbyMediaId,
} from "../src/controllers/media.Controller";
import * as mediaServiceController from "../src/service/mediaService.Controller";
import { ErrorLogger } from "../src/utils/errorLogger.Utils";
import { error1 } from "../src/constants";

// Mock the service and error logger
jest.mock("../src/service/mediaService.Controller");
jest.mock("../src/utils/errorLogger.Utils");

describe("Media Service Controller Tests", () => {
  // Common setup for each test
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
      headers: {},
      body: {},
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("kisanBytes", () => {
    it("should fetch kisan bytes successfully", async () => {
      // Arrange
      const mockKisanBytes = [{ id: "1", title: "Test Kisan Byte" }];
      mockReq.query = { pageNum: 1, pageSize: 10 };
      mockReq.headers.userId = "user123";

      mediaServiceController.getKisanReels.mockResolvedValue(mockKisanBytes);

      // Act
      await kisanBytes(mockReq, mockRes);

      // Assert
      expect(mediaServiceController.getKisanReels).toHaveBeenCalledWith(
        1,
        10,
        "user123"
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockKisanBytes);
      expect(ErrorLogger.info).toHaveBeenCalled();
    });

    it("should handle errors when fetching kisan bytes", async () => {
      // Arrange
      mockReq.query = { pageNum: 1, pageSize: 10 };
      mockReq.headers.userId = "user123";

      const mockError = new Error("Fetch failed");
      mediaServiceController.getKisanReels.mockRejectedValue(mockError);

      // Act
      await kisanBytes(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(error1);
      expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
      expect(ErrorLogger.error).toHaveBeenCalled();
    });
  });

  describe("getMediaById", () => {
    it("should fetch media by ID successfully", async () => {
      // Arrange
      const mockMedia = { id: "1", title: "Test Media" };
      mockReq.query = { mediaId: "1" };
      mockReq.headers.userId = "user123";

      mediaServiceController.mediaById.mockResolvedValue(mockMedia);

      // Act
      await getMediaById(mockReq, mockRes);

      // Assert
      expect(mediaServiceController.mediaById).toHaveBeenCalledWith(
        "1",
        "user123"
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockMedia);
      expect(ErrorLogger.info).toHaveBeenCalled();
    });

    it("should handle errors when fetching media by ID", async () => {
      // Arrange
      mockReq.query = { mediaId: "1" };
      mockReq.headers.userId = "user123";

      const mockError = new Error("Media not found");
      mediaServiceController.mediaById.mockRejectedValue(mockError);

      // Act
      await getMediaById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(error1);
      expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
      expect(ErrorLogger.error).toHaveBeenCalled();
    });
  });

  describe("kisanBytesActivities", () => {
    it("should save kisan bytes activity successfully", async () => {
      // Arrange
      const mockActivity = {
        activityType: "LIKE",
        mediaId: "1",
        userId: "user123",
      };
      mockReq.body = mockActivity;

      mediaServiceController.KisanBytesActivities.mockResolvedValue(true);

      // Act
      await kisanBytesActivities(mockReq, mockRes);

      // Assert
      expect(mediaServiceController.KisanBytesActivities).toHaveBeenCalledWith(
        mockActivity
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        result: "Success",
        message: "Activity saved successfully",
      });
      expect(ErrorLogger.info).toHaveBeenCalled();
    });

    it("should handle errors when saving kisan bytes activity", async () => {
      // Arrange
      const mockActivity = {
        activityType: "LIKE",
        mediaId: "1",
        userId: "user123",
      };
      mockReq.body = mockActivity;

      const mockError = new Error("Save failed");
      mediaServiceController.KisanBytesActivities.mockRejectedValue(mockError);

      // Act
      await kisanBytesActivities(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(error1);
      expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
      expect(ErrorLogger.error).toHaveBeenCalled();
    });
  });

  describe("getCommentsbyMediaId", () => {
    it("should fetch comments by media ID successfully", async () => {
      // Arrange
      const mockComments = [{ id: "1", comment: "Test Comment" }];
      mockReq.query = {
        mediaId: "1",
        pageNum: 1,
        pageSize: 10,
      };

      mediaServiceController.getCommentsByMediaId.mockResolvedValue(
        mockComments
      );

      // Act
      await getCommentsbyMediaId(mockReq, mockRes);

      // Assert
      expect(mediaServiceController.getCommentsByMediaId).toHaveBeenCalledWith(
        "1",
        "COMMENT",
        1,
        10
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockComments);
      expect(ErrorLogger.info).toHaveBeenCalled();
    });

    it("should handle errors when fetching comments by media ID", async () => {
      // Arrange
      mockReq.query = {
        mediaId: "1",
        pageNum: 1,
        pageSize: 10,
      };

      const mockError = new Error("Comments fetch failed");
      mediaServiceController.getCommentsByMediaId.mockRejectedValue(mockError);

      // Act
      await getCommentsbyMediaId(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(error1);
      expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
      expect(ErrorLogger.error).toHaveBeenCalled();
    });
  });
});
