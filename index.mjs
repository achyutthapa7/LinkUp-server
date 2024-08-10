import dotenv from "dotenv";
dotenv.config();
import "./conn/conn.js";
import express from "express";
import { router } from "./routes/routes.js";
const app = express();
const PORT = process.env.PORT || 4000;
import cookieParser from "cookie-parser";
import cors from "cors";
//middleware
app.use(cors());
app.use("/images", express.static("./uploads"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);
app.listen(PORT, () => {
  console.log("Server listening on port number: " + PORT);
});
