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
  const addTasks = useStore((s) => s.addTasks);

  const toggleVoice = () => {
    if (listening) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as ArrayLike<SpeechRecognitionResult>)
        .slice(e.resultIndex)
        .map((r) => r[0].transcript)
        .join(" ");
      setText((prev) => prev + (prev ? " " : "") + transcript);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
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
      className="flex flex-col px-5 pt-14"
      style={{ minHeight: "calc(100dvh - 5rem)", paddingBottom: "1.5rem" }}
    >
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Brain Dump</h1>
        <p className="text-sm text-gray-400 mt-1">Type or speak everything on your mind</p>
      </div>

      {/* Textarea — fills remaining space */}
      <textarea
        className="flex-1 w-full px-5 py-4 rounded-3xl border border-gray-100 bg-gray-50 text-gray-900 text-base resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-200 placeholder-gray-300 leading-relaxed"
        placeholder={
          "e.g. Send invoice to Acme by Friday.\nFix the auth bug, it's blocking the team.\nCall mom this weekend.\nClean my desk at some point…"
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {/* Bottom actions */}
      <div className="mt-5 flex flex-col items-center gap-4">
        {/* Mic button — centered */}
        <button
          onClick={toggleVoice}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-sm ${
            listening
              ? "bg-red-500 text-white scale-90 shadow-red-100"
              : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 active:scale-95"
          }`}
          aria-label={listening ? "Stop recording" : "Start voice input"}
        >
          {listening ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {/* Send button — full width */}
        <button
          onClick={parse}
          disabled={!text.trim() || loading}
          className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-semibold text-base disabled:opacity-30 flex items-center justify-center gap-2 transition-all hover:bg-indigo-700 active:scale-[0.98]"
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
            <>
              Parse with AI
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
