// src/database/db/dbConnection.js
import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
import { DB_NAME } from "../../constants.js";
import { ErrorLogger } from "../../utils/errorLogger.Utils.js";

// eslint-disable-next-line no-undef
const uri = process.env.MONGO_URI;

if (!uri) {
  const error = new Error(
    "MongoDB connection string is undefined. Please check your environment variables."
  );
  ErrorLogger.error("Database", "MongoDB URI is missing", error);
  throw error;
}

const client = new MongoClient(uri);
let dbInstance;

async function connect() {
  try {
    ErrorLogger.info("Database", "Attempting to connect to MongoDB...");

    await client.connect();
    dbInstance = client.db(DB_NAME);

    // Test the connection
    await dbInstance.command({ ping: 1 });

    ErrorLogger.info(
      "Database",
      `Successfully connected to MongoDB database: ${DB_NAME}`
    );

    return dbInstance;
  } catch (err) {
    ErrorLogger.error(
      "Database",
      `Failed to connect to MongoDB database: ${DB_NAME}`,
      err
    );
    throw err;
  }
}

async function disconnect() {
  try {
    ErrorLogger.info("Database", "Attempting to disconnect from MongoDB...");

    await client.close();

    ErrorLogger.info("Database", "Successfully disconnected from MongoDB");
  } catch (err) {
    ErrorLogger.error("Database", "Failed to disconnect from MongoDB", err);
    throw err;
  }
}

// Add connection state monitoring
client.on("connectionCreated", () => {
  ErrorLogger.info("Database", "New connection created");
});

client.on("connectionClosed", () => {
  ErrorLogger.info("Database", "Connection closed");
});

client.on("connectionPoolCreated", () => {
  ErrorLogger.info("Database", "Connection pool created");
});

client.on("connectionPoolClosed", () => {
  ErrorLogger.info("Database", "Connection pool closed");
});

client.on("error", (error) => {
  ErrorLogger.error("Database", "MongoDB client error", error);
});


export { connect, disconnect, dbInstance };

