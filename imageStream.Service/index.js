import dotenv from "dotenv";
import { connect } from "./src/database/db/dbConnection.js"
import { app } from "./src/app.js";

dotenv.config({
  path: "./.env",
});
/*global process*/ 
const port = process.env.PORT || 7001;

connect()
  .then(() => {
    app
      .listen(port, () => {
        console.log(`Server is running on port ${port}`);
      })
      .on("error", (err) => {
        console.error("Failed to start server:", err);
      });
  })
  .catch((err) => {
    console.error("MongoDB connection failed!!", err);
  });
