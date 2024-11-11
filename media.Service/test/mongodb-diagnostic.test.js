/* eslint-disable no-undef */
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./.env" });

describe("MongoDB Connection", () => {
  let client;

  // Increase timeout for potential slow connections
  jest.setTimeout(30000);

  // Cleanup function to ensure connection is closed after tests
  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  // Basic connectivity test
  it("should connect to MongoDB", async () => {
    const uri = process.env.MONGO_URI;

    // Validate URI
    expect(uri).toBeDefined();
    expect(uri).not.toBeNull();
    expect(uri.length).toBeGreaterThan(0);

    // Attempt connection
    try {
      client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
      });

      await client.connect();

      // Verify connection
      const adminDb = client.db().admin();
      const serverStatus = await adminDb.serverStatus();

      // Assertions instead of console logs
      expect(serverStatus).toBeDefined();
      expect(serverStatus.version).toBeTruthy();

      // Optional: Check databases
      const databases = await adminDb.listDatabases();
      expect(databases.databases).toBeDefined();
      expect(databases.databases.length).toBeGreaterThan(0);
    } catch (error) {
      // Fail the test with detailed error
      throw new Error(`MongoDB Connection Failed: ${error.message}`);
    }
  });

  // Optional: Specific connection detail tests
  it("should have expected database configuration", async () => {
    // Assuming client is already connected from previous test
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();

    // Check for specific databases or conditions
    const databaseNames = databases.databases.map((db) => db.name);

    // Example assertions
    expect(databaseNames).toContain("admin");
    expect(databaseNames).toContain("local");
  });
});
