import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { v4 as uuidv4 } from "uuid";
import { Task } from "@/lib/types";

const ESTIMATE_BUCKETS = [5, 15, 30, 60, 120, 240];

function nearestBucket(n: number): number {
  return ESTIMATE_BUCKETS.reduce((prev, curr) =>
    Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev
  );
}

const SYSTEM = `You are a task extraction assistant. The user will give you a messy brain dump — notes, worries, reminders, half-sentences — and you extract every actionable item as structured JSON.

Rules:
- Return ONLY a raw JSON array. No markdown, no explanation, no code fences.
- Each element must match this TypeScript type exactly:
  {
    title: string;           // imperative, max 10 words, e.g. "Send invoice to Acme"
    notes?: string;          // extra context, only if present in source text
    priority: "must" | "nice";
    estimateMinutes: 5 | 15 | 30 | 60 | 120 | 240;
    deadline?: string;       // YYYY-MM-DD only; omit if no date mentioned
    sourceText: string;      // exact fragment from input that produced this task
  }
- priority is "must" if: there's a deadline, someone is waiting, or it's blocking other work. Otherwise "nice".
- estimateMinutes: pick the closest bucket. When in doubt, round up.
- If a deadline is relative ("tomorrow", "end of week"), resolve it against today: {TODAY}.
- Ignore vague non-tasks ("I should really…", "someday maybe") unless they have a clear action.
- If the input contains no actionable tasks, return an empty array: []`;

async function callAI(text: string): Promise<unknown[]> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  const today = new Date().toISOString().slice(0, 10);
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    temperature: 0,
    system: SYSTEM.replace("{TODAY}", today),
    messages: [{ role: "user", content: text }],
  });
  const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "[]";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 500 });
  }

  let raw: string;
  try {
    ({ raw } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!raw?.trim()) {
    return NextResponse.json({ error: "raw is required" }, { status: 400 });
  }

  const text = raw.trim().slice(0, 4000);
  let parsed: unknown[];

  try {
    parsed = await callAI(text);
  } catch (err) {
    console.error("[parse] first attempt failed:", err);
    try {
      parsed = await callAI(text);
    } catch (err2) {
      console.error("[parse] retry failed:", err2);
      return NextResponse.json(
        { error: "AI parsing failed. Please try again." },
        { status: 500 }
      );
    }
  }

  const now = new Date().toISOString();
  const tasks: Task[] = (parsed as Record<string, unknown>[])
    .filter((t) => t && typeof t.title === "string")
    .map((t) => ({
      id: uuidv4(),
      title: t.title as string,
      notes: typeof t.notes === "string" ? t.notes : undefined,
      priority: t.priority === "must" ? "must" : ("nice" as const),
      estimateMinutes: nearestBucket(
        typeof t.estimateMinutes === "number" ? t.estimateMinutes : 30
      ),
      deadline: typeof t.deadline === "string" ? t.deadline : undefined,
      sourceText: typeof t.sourceText === "string" ? t.sourceText : undefined,
      status: "inbox" as const,
      createdAt: now,
    }));

  return NextResponse.json({ tasks });
}
