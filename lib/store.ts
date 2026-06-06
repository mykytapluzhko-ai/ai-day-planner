"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task } from "./types";

interface PlannerStore {
  tasks: Task[];
  lastParsedAt?: string;
  addTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addToToday: (id: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
}

export const useStore = create<PlannerStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTasks: (newTasks) =>
        set((state) => ({
          tasks: [...state.tasks, ...newTasks],
          lastParsedAt: new Date().toISOString(),
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      addToToday: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "today" as const,
                  scheduledFor: new Date().toISOString().slice(0, 10),
                }
              : t
          ),
        })),
      completeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: "done" as const, completedAt: new Date().toISOString() }
              : t
          ),
        })),
      uncompleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: "today" as const, completedAt: undefined } : t
          ),
        })),
    }),
    { name: "planner_v1" }
  )
);
