/* eslint-disable no-undef */
import {
  getKisanReels,
  KisanBytesActivities,
  getCommentsByMediaId,
  mediaById,
} from "../src/service/mediaService.Controller";
import { connect } from "../src/database/db/dbConnection";
import { ObjectId } from "mongodb";
import { ErrorLogger } from "../src/utils/errorLogger.Utils";

// test/service.test.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// Diagnostic logging
console.log('MongoDB Import:', MongoClient);
console.log('MongoDB Import Type:', typeof MongoClient);

describe('MongoDB Service Diagnostics', () => {
  it('should verify MongoClient import', () => {
    // Check MongoClient properties
    expect(MongoClient).toBeDefined();
    expect(typeof MongoClient).toBe('function');
    expect(MongoClient.prototype).toBeDefined();
  });

  it('should create MongoClient instance', () => {
    const uri = process.env.MONGO_URI;
    
    // Verify URI
    expect(uri).toBeDefined();
    expect(uri).not.toBeNull();

    // Attempt to create client
    const client = new MongoClient(uri);
    
    expect(client).toBeDefined();
    expect(client).not.toBeNull();
  });
});

// Mock dependencies
jest.mock("../src/database/db/dbConnection");
jest.mock("../src/utils/errorLogger.Utils");
jest.mock("mongodb", () => ({
  ObjectId: jest.fn(),
}));

describe("Media Service Controller", () => {
  let mockDb;
  let mockCollection;

  beforeEach(() => {
    // Setup mock collection and database
    mockCollection = {
      aggregate: jest.fn(),
      insertOne: jest.fn(),
      find: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    // Mock connect to return mockDb
    connect.mockResolvedValue(mockDb);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("getKisanReels", () => {
    it("should fetch kisan reels successfully", async () => {
      // Prepare mock data
      const mockReels = [
        {
          _id: new ObjectId("60d5ecb8b3b3a3001f3e1234"),
          title: "Test Reel",
          contentType: "video",
        },
      ];

      // Mock aggregate method
      mockCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockReels),
      });

      // Call the method
      const result = await getKisanReels(1, 10, "user123");

      // Assertions
      expect(result).toEqual(mockReels);
      expect(mockCollection.aggregate).toHaveBeenCalled();
      expect(ErrorLogger.error).not.toHaveBeenCalled();
    });

    it("should handle errors when fetching kisan reels", async () => {
      // Simulate database error
      const mockError = new Error("Database connection failed");
      connect.mockRejectedValue(mockError);

      // Call the method and expect it to throw
      await expect(getKisanReels(1, 10, "user123")).rejects.toThrow(mockError);

      // Verify error logging
      expect(ErrorLogger.error).toHaveBeenCalledWith(
        "getKisanReels",
        expect.stringContaining("Failed to fetch kisan reels"),
        mockError
      );
    });
  });

  describe("KisanBytesActivities", () => {
    it("should save kisan bytes activity successfully", async () => {
      // Prepare mock activity
      const mockActivity = {
        activityType: "LIKE",
        mediaId: "60d5ecb8b3b3a3001f3e1234",
        userId: "user123",
      };

      // Mock insertOne method
      mockCollection.insertOne.mockResolvedValue({
        insertedId: new ObjectId("60d5ecb8b3b3a3001f3e5678"),
      });

      // Call the method
      const result = await KisanBytesActivities(mockActivity);

      // Assertions
      expect(result).toBeTruthy();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockActivity,
          createdOn: expect.any(Date),
          updatedOn: expect.any(Date),
          isDeleted: false,
        })
      );
      expect(ErrorLogger.error).not.toHaveBeenCalled();
    });

    it("should handle errors when saving activity", async () => {
      // Prepare mock activity
      const mockActivity = {
        activityType: "LIKE",
        mediaId: "60d5ecb8b3b3a3001f3e1234",
        userId: "user123",
      };

      // Simulate database error
      const mockError = new Error("Save failed");
      mockCollection.insertOne.mockRejectedValue(mockError);

      // Call the method and expect it to throw
      await expect(KisanBytesActivities(mockActivity)).rejects.toThrow(
        mockError
      );

      // Verify error logging
      expect(ErrorLogger.error).toHaveBeenCalledWith(
        "KisanBytesActivities",
        "Failed to save kisan bytes activity",
        mockError
      );
    });
  });

  describe("getCommentsByMediaId", () => {
    it("should fetch comments successfully", async () => {
      // Prepare mock comments
      const mockComments = [
        {
          _id: new ObjectId("60d5ecb8b3b3a3001f3e1234"),
          comments: "Great video!",
          userId: "user123",
        },
      ];

      // Mock ObjectId constructor
      ObjectId.mockImplementation((id) => id);

      // Mock aggregate method
      mockCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockComments),
      });

      // Call the method
      const result = await getCommentsByMediaId(
        "60d5ecb8b3b3a3001f3e1234",
        "COMMENT",
        1,
        10
      );

      // Assertions
      expect(result).toEqual(mockComments);
      expect(mockCollection.aggregate).toHaveBeenCalled();
      expect(ErrorLogger.error).not.toHaveBeenCalled();
    });

    it("should handle invalid mediaId", async () => {
      // Mock invalid ObjectId creation
      ObjectId.mockImplementation(() => {
        throw new Error("Invalid ObjectId");
      });

      // Call the method and expect it to throw
      await expect(
        getCommentsByMediaId("invalid-id", "COMMENT", 1, 10)
      ).rejects.toThrow("Invalid mediaId format");

      // Verify error logging
      expect(ErrorLogger.error).toHaveBeenCalled();
    });
  });

  describe("mediaById", () => {
    it("should fetch media successfully", async () => {
      // Prepare mock media
      const mockMedia = {
        _id: new ObjectId("60d5ecb8b3b3a3001f3e1234"),
        title: "Test Media",
        contentType: "video",
      };

      // Mock ObjectId constructor
      ObjectId.mockImplementation((id) => id);

      // Mock aggregate method
      mockCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([mockMedia]),
      });

      // Call the method
      const result = await mediaById("60d5ecb8b3b3a3001f3e1234", "user123");

      // Assertions
      expect(result).toEqual(mockMedia);
      expect(mockCollection.aggregate).toHaveBeenCalled();
      expect(ErrorLogger.error).not.toHaveBeenCalled();
    });

    it("should return null if no media found", async () => {
      // Mock ObjectId constructor
      ObjectId.mockImplementation((id) => id);

      // Mock aggregate method to return empty array
      mockCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      // Call the method
      const result = await mediaById("60d5ecb8b3b3a3001f3e1234", "user123");

      // Assertions
      expect(result).toBeUndefined();
      expect(mockCollection.aggregate).toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Simulate database error
      const mockError = new Error("Database query failed");
      mockCollection.aggregate.mockRejectedValue(mockError);

      // Call the method and expect it to throw
      await expect(
        mediaById("60d5ecb8b3b3a3001f3e1234", "user123")
      ).rejects.toThrow(mockError);

      // Verify error logging
      expect(ErrorLogger.error).toHaveBeenCalledWith(
        "mediaById",
        expect.stringContaining("Failed to fetch media by ID"),
        mockError
      );
    });
  });
});
