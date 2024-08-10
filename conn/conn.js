import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// Connect to MongoDB
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });
