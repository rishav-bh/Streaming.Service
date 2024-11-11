/* eslint-disable no-undef */
// test/errorLogger.test.js
import { ErrorLogger, LOG_LEVELS } from "../src/utils/errorLogger.Utils.js";

describe("ErrorLogger", () => {
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleInfoSpy;
  let consoleDebugSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();

    process.env.DEBUG_MODE = "true";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test LOG_LEVELS object
  describe("LOG_LEVELS", () => {
    it("should have correct log level constants", () => {
      expect(LOG_LEVELS).toEqual({
        INFO: "INFO",
        WARNING: "WARNING",
        ERROR: "ERROR",
        DEBUG: "DEBUG",
      });
    });
  });

  // Logging method tests
  describe("Logging Methods", () => {
    it("should log info messages", () => {
      const message = "Info message";
      const result = ErrorLogger.info("TestSource", message);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining(message),
        ""
      );

      // Verify returned object structure
      expect(result).toEqual(
        expect.objectContaining({
          timestamp: expect.any(String),
          level: LOG_LEVELS.INFO,
          source: "TestSource",
          message: message,
        })
      );
    });

    it("should log error messages", () => {
      const message = "Error message";
      const error = new Error("Test error");
      const result = ErrorLogger.error("TestSource", message, error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(message),
        error
      );

      // Verify returned object structure
      expect(result).toEqual(
        expect.objectContaining({
          timestamp: expect.any(String),
          level: LOG_LEVELS.ERROR,
          source: "TestSource",
          message: message,
          errorMessage: error.message,
          stack: error.stack,
        })
      );
    });

    it("should log warning messages", () => {
      const message = "Warning message";
      const result = ErrorLogger.warn("TestSource", message);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(message),
        ""
      );

      // Verify returned object structure
      expect(result).toEqual(
        expect.objectContaining({
          timestamp: expect.any(String),
          level: LOG_LEVELS.WARNING,
          source: "TestSource",
          message: message,
        })
      );
    });

    it("should log debug messages when DEBUG_MODE is true", () => {
      const message = "Debug message";
      const result = ErrorLogger.debug("TestSource", message);

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining(message),
        ""
      );

      // Verify returned object structure
      expect(result).toEqual(
        expect.objectContaining({
          timestamp: expect.any(String),
          level: LOG_LEVELS.DEBUG,
          source: "TestSource",
          message: message,
        })
      );
    });

    it("should not log debug messages when DEBUG_MODE is false", () => {
      process.env.DEBUG_MODE = "false";

      const message = "Debug message";
      const result = ErrorLogger.debug("TestSource", message);

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
