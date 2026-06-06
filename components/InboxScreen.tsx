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
    <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Priority stripe */}
      <div
        className={`absolute left-0 inset-y-0 w-1 ${
          task.priority === "must" ? "bg-red-400" : "bg-gray-200"
        }`}
      />

      {/* Content */}
      <div className="pl-5 pr-4 pt-4 pb-3">
        <p className="font-semibold text-gray-900 text-[15px] leading-snug">{task.title}</p>
        {task.notes && (
          <p className="text-sm text-gray-400 mt-1 leading-snug">{task.notes}</p>
        )}
        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
            {fmtEstimate(task.estimateMinutes)}
          </span>
          {task.deadline && (
            <span
              className={`text-xs font-medium ${
                deadlineOverdue ? "text-red-500" : "text-orange-500"
              }`}
            >
              {fmtDeadline(task.deadline)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex divide-x divide-gray-100 border-t border-gray-50">
        <button
          onClick={() => addToToday(task.id)}
          className="flex-1 py-3 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
        >
          Today
        </button>
        <button
          onClick={handleLater}
          className={`flex-1 py-3 text-xs font-semibold transition-colors ${
            laterFlash
              ? "text-emerald-600 bg-emerald-50"
              : "text-gray-400 hover:bg-gray-50 active:bg-gray-100"
          }`}
        >
          {laterFlash ? "Saved ✓" : "Later"}
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="flex-1 py-3 text-xs font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
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
            <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-300">Your inbox is empty</p>
          <p className="text-xs text-gray-300 mt-1">Go to Capture and do a brain dump</p>
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
