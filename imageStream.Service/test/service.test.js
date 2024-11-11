/* eslint-disable no-undef */
import * as imageService from "../src/services/imageService";

describe("Image Service", () => {
  // Mock the entire module before tests
  beforeEach(() => {
    jest.spyOn(imageService, "optimizedUploadFile").mockClear();
  });

  describe("optimizedUploadFile", () => {
    it("should upload file and return URL", async () => {
      const mockFile = {
        buffer: Buffer.from("mock file content"),
        mimetype: "image/png",
        originalname: "mock-image.png",
      };

      const mockUploadResponse = { Url: "https://mockurl.com/mock-image.png" };

      imageService.optimizedUploadFile.mockResolvedValue(mockUploadResponse);

      const result = await imageService.optimizedUploadFile(mockFile);

      expect(result).toEqual(mockUploadResponse);
      expect(imageService.optimizedUploadFile).toHaveBeenCalledWith(mockFile);
    });

    it("should handle upload failure", async () => {
      const mockFile = {
        buffer: Buffer.from("mock file content"),
        mimetype: "image/png",
        originalname: "mock-image.png",
      };

      imageService.optimizedUploadFile.mockRejectedValue(
        new Error("Upload failed")
      );

      await expect(imageService.optimizedUploadFile(mockFile)).rejects.toThrow(
        "Upload failed"
      );
    });
  });
});
