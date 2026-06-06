"use client";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { Task } from "@/lib/types";

interface Props {
  onParsed: () => void;
}

export default function CaptureScreen({ onParsed }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const keepListeningRef = useRef(false);
  const addTasks = useStore((s) => s.addTasks);

  const toggleVoice = () => {
    if (listening) {
      keepListeningRef.current = false;
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "uk-UA";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as ArrayLike<SpeechRecognitionResult>)
        .slice(e.resultIndex)
        .map((r) => r[0].transcript)
        .join(" ");
      setText((prev) => prev + (prev ? " " : "") + transcript);
    };
    rec.onend = () => {
      // Auto-restart on silence timeout so recording doesn't cut off
      if (keepListeningRef.current) {
        try { rec.start(); } catch { /* already starting */ }
      } else {
        setListening(false);
      }
    };
    rec.start();
    recognitionRef.current = rec;
    keepListeningRef.current = true;
    setListening(true);
  };

  const parse = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      addTasks(data.tasks as Task[]);
      setText("");
      onParsed();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: "calc(100dvh - 5rem - env(safe-area-inset-bottom, 0px))" }}
    >
      {/* Title on gray background */}
      <div className="px-5 pt-14 pb-3">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dayflow</h1>
      </div>

      {/* White card — 20px side margins, top corners rounded (nested radius), bottom straight, flush with nav */}
      <div
        className="flex flex-col flex-1 bg-white overflow-hidden mx-5 px-5 pt-6 pb-6"
        style={{ borderRadius: "24px" }}
      >
        {/* Textarea fills top portion */}
        <textarea
          className="flex-1 w-full text-gray-900 text-base resize-none focus:outline-none bg-transparent leading-relaxed"
          style={{ color: "rgba(0,0,0,0.9)" }}
          placeholder="Type or speak everything on your mind"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        {/* Buttons at the bottom of the card */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={parse}
            disabled={!text.trim() || loading}
            className="flex-1 h-14 rounded-2xl font-semibold text-base disabled:opacity-30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ backgroundColor: "#D8D9DB", color: "#4F535E" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 opacity-70" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Parsing…
              </>
            ) : (
              "Parse with AI"
            )}
          </button>

          <button
            onClick={toggleVoice}
            className="mic-btn w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              backgroundColor: listening ? "#4F535E" : "#D8D9DB",
              color: listening ? "#ffffff" : "#4F535E",
            }}
            aria-label={listening ? "Stop recording" : "Start voice input"}
          >
            {listening ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
