"use client";

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
    <button
      onClick={done ? onUncomplete : onComplete}
      className="w-full flex items-center gap-4 bg-white rounded-2xl shadow-sm px-4 py-4 text-left active:scale-[0.98] overflow-hidden relative transition-all"
    >
      {/* Priority stripe */}
      <div
        className={`absolute left-0 inset-y-0 w-1 transition-colors ${
          done
            ? "bg-gray-100"
            : task.priority === "must"
            ? "bg-red-400"
            : "bg-gray-200"
        }`}
      />

      {/* Checkbox */}
      <div
        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          done
            ? "border-indigo-500 bg-indigo-500"
            : task.priority === "must"
            ? "border-red-300"
            : "border-gray-200"
        }`}
      >
        {done && (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 14" fill="none">
            <path
              d="M2.5 7L5.5 10L11.5 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pl-1">
        <p
          className={`font-semibold text-[15px] leading-snug transition-all ${
            done ? "line-through text-gray-300" : "text-gray-900"
          }`}
        >
          {task.title}
        </p>
        {task.notes && !done && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{task.notes}</p>
        )}
      </div>

      {/* Estimate */}
      <span
        className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
          done ? "text-gray-200 bg-gray-50" : "text-gray-400 bg-gray-50"
        }`}
      >
        {fmtEstimate(task.estimateMinutes)}
      </span>
    </button>
  );
}

export default function TodayScreen() {
  const { tasks, completeTask, uncompleteTask } = useStore();
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

  return (
    <div className="px-5 pt-14 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Today</h1>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
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
          {todayTasks.map((task) => (
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
