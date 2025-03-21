import { z } from "zod";

// Define a Zod schema for the Task
const TaskSchema = z.object({
  _id: z.string().optional(),
  title: z
    .string()
    .min(1, "Title must be at least 1 characters long")
    .max(20, "Title must not be more than 20 characters long")
    .refine((value) => value.trim().length > 1, {
      message: "Title must be at least 1 characters long",
    }),
  status: z.enum(["pending", "completed"]).default("pending"),
});

export default TaskSchema;
