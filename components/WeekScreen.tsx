"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Task } from "@/lib/types";

type Filter = "all" | "must" | "nice";

function fmtEstimate(m: number) {
  return m < 60 ? `${m}m` : `${m / 60}h`;
}

function TaskCard({
  task,
  onComplete,
  onUncomplete,
}: {
  task: Task;
  onComplete: () => void;
  onUncomplete: () => void;
}) {
  const done = task.status === "done";
  const interactive = task.status === "today" || task.status === "done";

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-4">
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

        <p
          className={`font-semibold text-[15px] leading-snug${done ? " line-through" : ""}`}
          style={{ color: done ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.9)" }}
        >
          {task.title}
        </p>

        {task.notes && !done && (
          <p className="text-sm mt-1 leading-snug" style={{ color: "rgba(0,0,0,0.6)" }}>
            {task.notes}
          </p>
        )}

        {interactive && (
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
        )}
      </div>
    </div>
  );
}

function getWeekDates(): Date[] {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeekScreen() {
  const { tasks, completeTask, uncompleteTask } = useStore();
  const [filter, setFilter] = useState<Filter>("all");

  const todayStr = new Date().toISOString().slice(0, 10);
  const weekDates = getWeekDates();

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "must", label: "Must" },
    { id: "nice", label: "Nice" },
  ];

  function getTasksForDay(dateStr: string): Task[] {
    const raw = tasks.filter((t) => {
      if (t.status === "cancelled") return false;
      if (t.status === "today") {
        // Show under their scheduledFor date, falling back to today
        return (t.scheduledFor ?? todayStr) === dateStr;
      }
      if (t.status === "done") {
        return t.completedAt?.slice(0, 10) === dateStr;
      }
      // Inbox tasks with a deadline show on their deadline day
      if (t.status === "inbox" && t.deadline === dateStr) return true;
      return false;
    });

    const filtered = filter === "all" ? raw : raw.filter((t) => t.priority === filter);

    return filtered.sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (b.status === "done" && a.status !== "done") return -1;
      if (a.priority !== b.priority) return a.priority === "must" ? -1 : 1;
      return a.estimateMinutes - b.estimateMinutes;
    });
  }

  const hasAnyTasks = weekDates.some(
    (d) => getTasksForDay(d.toISOString().slice(0, 10)).length > 0
  );

  const weekStart = weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekEnd = weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="px-5 pt-14 pb-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Week</h1>
        <p className="text-sm text-gray-400 mt-1">
          {weekStart} – {weekEnd}
        </p>
      </div>

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

      {!hasAnyTasks ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-5">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: "#D8D9DB" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "#D8D9DB" }}>
            Nothing scheduled this week
          </p>
          <p className="text-xs mt-1" style={{ color: "#D8D9DB" }}>
            Add deadlines to tasks in your Inbox
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {weekDates.map((date) => {
            const dateStr = date.toISOString().slice(0, 10);
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const dayTasks = getTasksForDay(dateStr);

            return (
              <div key={dateStr}>
                <div className="flex items-baseline gap-1.5 mb-2.5">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: isToday ? "#4F535E" : isPast ? "#C4C4CC" : "rgba(0,0,0,0.45)",
                    }}
                  >
                    {isToday ? "Today" : DAY_SHORT[date.getDay()]}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isToday ? "#4F535E" : isPast ? "#C4C4CC" : "rgba(0,0,0,0.28)",
                    }}
                  >
                    {date.getDate()}
                  </span>
                  {dayTasks.length === 0 && (
                    <span className="text-xs" style={{ color: "#D8D9DB" }}>
                      —
                    </span>
                  )}
                </div>

                {dayTasks.length > 0 && (
                  <div className="space-y-2.5">
                    {dayTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={() => completeTask(task.id)}
                        onUncomplete={() => uncompleteTask(task.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
