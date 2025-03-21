import express, { Request, Response } from "express";
import Task from "../models/task";
import TaskSchema from "../zod";

const router = express.Router();

// Health check
router.get("/healthz", (req: Request, res: Response) => {
  res.sendStatus(200);
});

// Get all tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get single task
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    res.status(200).json(task);
  } catch (error) {
    res.status(404).json({ error: "Task not found" });
  }
});

// Add new task
router.post("/", async (req: Request, res: Response) => {
  try {
    const result = TaskSchema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ error: result.error.issues[0].message });
      return;
    }
    const task = new Task(result.data);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    if ((error as any).code === 11000) {
      res.status(400).json({ error: "Task Title should be unique" });
    } else {
      res.status(400).json({ error: "Bad request" });
    }
  }
});

// Update task
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const result = TaskSchema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ error: result.error.issues[0].message });
      return;
    }
    const taskData = result.data;
    const task = await Task.findByIdAndUpdate(req.params.id, taskData, {
      new: true,
    });
    res.status(204).json(task);
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
});

// Delete task
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Bad request" });
  }
});

// Delete all tasks
router.delete("/", async (req: Request, res: Response) => {
  try {
    await Task.deleteMany({});
    res.status(204).json({ message: "All tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server request" });
  }
});

export default router;
