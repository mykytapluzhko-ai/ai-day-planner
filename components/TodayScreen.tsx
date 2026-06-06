"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Task } from "@/lib/types";

function fmtEstimate(m: number) {
  return m < 60 ? `${m}m` : `${m / 60}h`;
}

function CheckItem({
  task,
  onComplete,
  onUncomplete,
}: {
  task: Task;
  onComplete: () => void;
  onUncomplete: () => void;
}) {
  const done = task.status === "done";

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-4">
        {/* Top row: priority pill (left) + time badge (right) */}
        <div className="flex items-center justify-between mb-2.5">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={
              task.priority === "must"
                ? { backgroundColor: done ? "#E0E0E0" : "#7EA78E", color: done ? "#999" : "#3D6151" }
                : { backgroundColor: done ? "#E0E0E0" : "#B6B69C", color: done ? "#999" : "#5C5C47" }
            }
          >
            {task.priority === "must" ? "Must" : "Nice"}
          </span>
          <span
            className="text-xs font-medium bg-gray-50 px-2.5 py-1 rounded-full"
            style={{ color: done ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.6)" }}
          >
            {fmtEstimate(task.estimateMinutes)}
          </span>
        </div>

        {/* Title */}
        <p
          className={`font-semibold text-[15px] leading-snug${done ? " line-through" : ""}`}
          style={{ color: done ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.9)" }}
        >
          {task.title}
        </p>

        {/* Notes */}
        {task.notes && !done && (
          <p className="text-sm mt-1 leading-snug" style={{ color: "rgba(0,0,0,0.6)" }}>
            {task.notes}
          </p>
        )}

        {/* Bottom row: checkbox aligned to right */}
        <div className="flex justify-end mt-3">
          <button
            onClick={done ? onUncomplete : onComplete}
            className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all active:scale-90"
            style={{
              borderColor: done ? "#4F535E" : "#D8D9DB",
              backgroundColor: done ? "#4F535E" : "transparent",
            }}
            aria-label={done ? "Mark as not done" : "Mark as done"}
          >
            {done && (
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.5 7L5.5 10L11.5 4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

type Filter = "all" | "must" | "nice";

export default function TodayScreen() {
  const { tasks, completeTask, uncompleteTask } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const today = new Date().toISOString().slice(0, 10);

  const todayTasks = tasks
    .filter(
      (t) =>
        t.status === "today" ||
        (t.status === "done" && t.completedAt?.slice(0, 10) === today)
    )
    .sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (b.status === "done" && a.status !== "done") return -1;
      if (a.priority !== b.priority) return a.priority === "must" ? -1 : 1;
      return a.estimateMinutes - b.estimateMinutes;
    });

  const visibleTasks =
    filter === "all" ? todayTasks : todayTasks.filter((t) => t.priority === filter);

  const pending = todayTasks.filter((t) => t.status === "today");
  const done = todayTasks.filter((t) => t.status === "done");
  const totalMin = pending.reduce((s, t) => s + t.estimateMinutes, 0);

  const subtitle =
    todayTasks.length === 0
      ? "Nothing planned yet"
      : pending.length === 0
      ? "All done!"
      : `${pending.length} left · ~${
          totalMin < 60 ? `${totalMin}m` : `${Math.round((totalMin / 60) * 10) / 10}h`
        }`;

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "must", label: "Must" },
    { id: "nice", label: "Nice" },
  ];

  return (
    <div className="px-5 pt-14 pb-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Today</h1>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-5">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                backgroundColor: active ? "#4F535E" : "#E8E8EC",
                color: active ? "#ffffff" : "#4F535E",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {todayTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-300">No tasks for today</p>
          <p className="text-xs text-gray-300 mt-1">Tap &ldquo;Today&rdquo; on tasks in your Inbox</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleTasks.map((task) => (
            <CheckItem
              key={task.id}
              task={task}
              onComplete={() => completeTask(task.id)}
              onUncomplete={() => uncompleteTask(task.id)}
            />
          ))}

          {done.length > 0 && pending.length > 0 && (
            <p className="text-xs text-gray-300 text-center pt-2 font-medium">
              {done.length} completed
            </p>
          )}
        </div>
      )}
    </div>
  );
}
