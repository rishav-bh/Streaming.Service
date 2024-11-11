// src/database/db/dbConnection.js
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { DB_NAME } from "../../constants.js";
import { ErrorLogger } from "../../utils/errorLogger.Utils.js";
/*global process*/ 
const uri = process.env.MONGO_URI;

if (!uri) {
  const error = new Error(
    "MongoDB connection string is undefined. Please check your environment variables."
  );
  ErrorLogger.error("Database", "MongoDB URI is missing", error);
  throw error;
}

async function connect() {
  try {
    ErrorLogger.info("Database", "Attempting to connect to MongoDB...");

    await mongoose.connect(uri, {
      dbName: DB_NAME,
    });

    // Check and log the connection state
    const connectionStates = [
      "Disconnected",
      "Connected",
      "Connecting",
      "Disconnecting",
    ];
    ErrorLogger.info(
      "Database",
      `Mongoose connection state: ${
        connectionStates[mongoose.connection.readyState]
      }`
    );

    // Add mongoose connection event listeners
    mongoose.connection.on("connected", () => {
      ErrorLogger.info("Database", "Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      ErrorLogger.error("Database", "Mongoose connection error", err);
    });

    mongoose.connection.on("disconnected", () => {
      ErrorLogger.info("Database", "Mongoose disconnected from MongoDB");
    });

    mongoose.connection.on("reconnected", () => {
      ErrorLogger.info("Database", "Mongoose reconnected to MongoDB");
    });

    ErrorLogger.info(
      "Database",
      `Successfully connected to MongoDB database: ${DB_NAME}`
    );

  } catch (err) {
    ErrorLogger.error("Database", "Failed to connect to MongoDB", err);
    throw err;
  }
}

async function disconnect() {
  try {
    ErrorLogger.info("Database", "Attempting to disconnect from MongoDB...");

    await mongoose.disconnect();

    ErrorLogger.info("Database", "Successfully disconnected from MongoDB");
  } catch (err) {
    ErrorLogger.error("Database", "Failed to disconnect from MongoDB", err);
    throw err;
  }
}

// Add uncaught exception handler
process.on("uncaughtException", (error) => {
  ErrorLogger.error(
    "Database",
    "Uncaught Exception in database connection",
    error
  );
  process.exit(1);
});

// Add unhandled rejection handler
process.on("unhandledRejection", (reason) => {
  ErrorLogger.error(
    "Database",
    "Unhandled Rejection in database connection",
    reason
  );
  process.exit(1);
});

// Monitor for process memory usage
// setInterval(() => {
//   const used = process.memoryUsage();
//   ErrorLogger.debug(
//     "Database",
//     `Memory usage - RSS: ${Math.round(
//       used.rss / 1024 / 1024
//     )}MB, Heap: ${Math.round(used.heapUsed / 1024 / 1024)}MB`
//   );
// }, 30000); // Log every 30 seconds


export { connect, disconnect };