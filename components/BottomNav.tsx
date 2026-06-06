"use client";

export type Screen = "capture" | "inbox" | "today";

interface Props {
  screen: Screen;
  onChange: (s: Screen) => void;
}

const tabs: { id: Screen; label: string; icon: React.ReactNode }[] = [
  {
    id: "capture",
    label: "Capture",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: "today",
    label: "Today",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
  },
];

export default function BottomNav({ screen, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white z-10">
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => {
          const active = screen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center pt-2 pb-5 gap-1 transition-colors"
            >
              <span style={{ color: active ? "#4F535E" : "#D8D9DB" }}>
                {tab.icon}
              </span>
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: active ? "#4F535E" : "#D8D9DB" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
