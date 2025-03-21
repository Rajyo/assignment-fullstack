export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  createdAt: Date;
}

export type TaskFilter = "all" | "active" | "completed";
