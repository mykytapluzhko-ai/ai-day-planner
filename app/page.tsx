"use client";

import { useState } from "react";
import BottomNav, { Screen } from "@/components/BottomNav";
import CaptureScreen from "@/components/CaptureScreen";
import InboxScreen from "@/components/InboxScreen";
import TodayScreen from "@/components/TodayScreen";
import WeekScreen from "@/components/WeekScreen";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("capture");

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F2F2F7" }}>
      <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
        >
        <div className="max-w-md mx-auto">
          {screen === "capture" && <CaptureScreen onParsed={() => setScreen("inbox")} />}
          {screen === "inbox" && <InboxScreen />}
          {screen === "today" && <TodayScreen />}
          {screen === "week" && <WeekScreen />}
        </div>
      </main>
      <BottomNav screen={screen} onChange={setScreen} />
    </div>
  );
}
