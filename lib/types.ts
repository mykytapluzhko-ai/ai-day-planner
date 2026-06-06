export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: "must" | "nice";
  estimateMinutes: number;
  deadline?: string;
  scheduledFor?: string;
  status: "inbox" | "today" | "done" | "cancelled";
  createdAt: string;
  completedAt?: string;
  sourceText?: string;
}

export interface AppState {
  tasks: Task[];
  lastParsedAt?: string;
}
