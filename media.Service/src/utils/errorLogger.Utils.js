// src/utils/errorLogger.Utils.js
/*global process*/
const LOG_LEVELS = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
};

class ErrorLogger {
  static log(level, source, message, error = null) {
    const timestamp = new Date().toISOString();
    const errorObject = {
      timestamp,
      level,
      source,
      message,
      ...(error && {
        errorMessage: error.message,
        stack: error.stack,
        code: error.code,
      }),
    };

    // Log to console with proper formatting
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(
          `[${timestamp}] [${level}] [${source}]: ${message}`,
          error || ""
        );
        break;
      case LOG_LEVELS.WARNING:
        console.warn(
          `[${timestamp}] [${level}] [${source}]: ${message}`,
          error || ""
        );
        break;
      case LOG_LEVELS.INFO:
        console.info(
          `[${timestamp}] [${level}] [${source}]: ${message}`,
          error || ""
        );
        break;
      case LOG_LEVELS.DEBUG:
        console.debug(
          `[${timestamp}] [${level}] [${source}]: ${message}`,
          error || ""
        );
        break;
      default:
        console.log(
          `[${timestamp}] [${level}] [${source}]: ${message}`,
          error || ""
        );
    }

    // Here you can add additional logging functionality like:
    // - Saving to a file
    // - Sending to a logging service
    // - Storing in database

    return errorObject;
  }

  static error(source, message, error = null) {
    return this.log(LOG_LEVELS.ERROR, source, message, error);
  }

  static warn(source, message, error = null) {
    return this.log(LOG_LEVELS.WARNING, source, message, error);
  }

  static info(source, message) {
    return this.log(LOG_LEVELS.INFO, source, message);
  }

  static debug(source, message) {
    if (process.env.DEBUG_MODE === "true") {
      return this.log(LOG_LEVELS.DEBUG, source, message);
    }
  }
}

export { ErrorLogger, LOG_LEVELS };
