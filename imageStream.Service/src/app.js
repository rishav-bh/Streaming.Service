import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";


const app = express();
/*global process*/ 
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(bodyParser.text({ type: "/" }));

app.use(cookieParser());

//routes import
import imageRoutes from "./routes/imageRoutes.js";

// routes declaration
app.use("/api/image", imageRoutes);

export { app };
