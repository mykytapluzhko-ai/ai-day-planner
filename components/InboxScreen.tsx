"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Task } from "@/lib/types";

function fmtEstimate(m: number) {
  return m < 60 ? `${m}m` : `${m / 60}h`;
}

function fmtDeadline(d: string) {
  const date = new Date(d + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TaskCard({ task }: { task: Task }) {
  const { deleteTask, addToToday } = useStore();
  const [laterFlash, setLaterFlash] = useState(false);

  const handleLater = () => {
    setLaterFlash(true);
    setTimeout(() => setLaterFlash(false), 1200);
  };

  const deadlineOverdue =
    task.deadline &&
    new Date(task.deadline + "T00:00:00") < new Date(new Date().toDateString());

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Content */}
      <div className="px-4 pt-4 pb-3">
        {/* Priority pill */}
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2.5"
          style={
            task.priority === "must"
              ? { backgroundColor: "#7EA78E", color: "#3D6151" }
              : { backgroundColor: "#B6B69C", color: "#5C5C47" }
          }
        >
          {task.priority === "must" ? "Must" : "Nice"}
        </span>

        <p
          className="font-semibold text-[15px] leading-snug"
          style={{ color: "rgba(0,0,0,0.9)" }}
        >
          {task.title}
        </p>
        {task.notes && (
          <p
            className="text-sm mt-1 leading-snug"
            style={{ color: "rgba(0,0,0,0.6)" }}
          >
            {task.notes}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2.5">
          <span
            className="text-xs font-medium bg-gray-50 px-2.5 py-1 rounded-full"
            style={{ color: "rgba(0,0,0,0.6)" }}
          >
            {fmtEstimate(task.estimateMinutes)}
          </span>
          {task.deadline && (
            <span
              className="text-xs font-medium"
              style={{ color: deadlineOverdue ? "#ef4444" : "rgba(0,0,0,0.6)" }}
            >
              {fmtDeadline(task.deadline)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex divide-x"
        style={{ borderTop: "1px solid #D8D9DB", borderColor: "#D8D9DB" }}
      >
        <button
          onClick={() => addToToday(task.id)}
          className="flex-1 py-3 text-xs font-semibold transition-colors hover:bg-gray-50 active:bg-gray-100"
          style={{ color: "#4F535E" }}
        >
          Today
        </button>
        <button
          onClick={handleLater}
          className="flex-1 py-3 text-xs font-semibold transition-colors hover:bg-gray-50 active:bg-gray-100"
          style={{
            color: laterFlash ? "#16a34a" : "rgba(0,0,0,0.4)",
            backgroundColor: laterFlash ? "#f0fdf4" : undefined,
            borderColor: "#D8D9DB",
          }}
        >
          {laterFlash ? "Saved ✓" : "Later"}
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="flex-1 py-3 text-xs font-semibold transition-colors hover:text-red-500 hover:bg-red-50 active:bg-red-100"
          style={{ color: "rgba(0,0,0,0.4)", borderColor: "#D8D9DB" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function InboxScreen() {
  const tasks = useStore((s) => s.tasks);

  const inboxTasks = tasks
    .filter((t) => t.status === "inbox")
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority === "must" ? -1 : 1;
      if (a.deadline && b.deadline) return a.deadline < b.deadline ? -1 : 1;
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    });

  return (
    <div className="px-5 pt-14 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inbox</h1>
        <p className="text-sm text-gray-400 mt-1">
          {inboxTasks.length === 0
            ? "No tasks yet"
            : `${inboxTasks.length} task${inboxTasks.length !== 1 ? "s" : ""} to review`}
        </p>
      </div>

      {inboxTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-5">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "#D8D9DB" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "#D8D9DB" }}>Your inbox is empty</p>
          <p className="text-xs mt-1" style={{ color: "#D8D9DB" }}>Go to Capture and do a brain dump</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inboxTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
