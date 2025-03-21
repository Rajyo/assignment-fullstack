import mongoose, { Schema } from "mongoose";

export interface ITask extends Document {
  title: string;
  status: "pending" | "completed";
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>("Task", TaskSchema);
