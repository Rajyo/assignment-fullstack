import express from "express";
import mongoose from "mongoose";
import taskRoutes from "./routes/taskRoutes";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/v1/tasks", taskRoutes);

// Connect to MongoDB and Start the server
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on port http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
