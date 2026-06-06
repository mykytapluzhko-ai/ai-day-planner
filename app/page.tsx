"use client";

import { useState } from "react";
import BottomNav, { Screen } from "@/components/BottomNav";
import CaptureScreen from "@/components/CaptureScreen";
import InboxScreen from "@/components/InboxScreen";
import TodayScreen from "@/components/TodayScreen";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("capture");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-md mx-auto">
          {screen === "capture" && <CaptureScreen onParsed={() => setScreen("inbox")} />}
          {screen === "inbox" && <InboxScreen />}
          {screen === "today" && <TodayScreen />}
        </div>
      </main>
      <BottomNav screen={screen} onChange={setScreen} />
    </div>
  );
}
