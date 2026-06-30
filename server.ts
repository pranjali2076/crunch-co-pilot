import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// ---------------------------------------------------------------------------
// Retry helper for transient Gemini errors (503/UNAVAILABLE, 429 rate limit)
// ---------------------------------------------------------------------------
async function generateWithRetry(
  ai: GoogleGenAI,
  params: any,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<any> {
  let lastError: any = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      lastError = err;
      const status = err?.error?.code || err?.status || err?.code;
      const isRetryable = status === 503 || status === 429 || err?.error?.status === "UNAVAILABLE";

      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt); // 1s, 2s, 4s...
      console.warn(`Gemini call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`, err?.error?.message || err?.message);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Real URL fetching: pulls actual page text so the model can see real
// syllabus/notes content instead of just a bare link string.
// ---------------------------------------------------------------------------
async function fetchUrlContent(url: string, maxChars = 6000): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LastMinuteLifeSaverBot/1.0)" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return `[Could not fetch ${url} — HTTP ${res.status}]`;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text") && !contentType.includes("html") && !contentType.includes("json")) {
      return `[Skipped ${url} — unsupported content type: ${contentType}]`;
    }

    const raw = await res.text();

    // Strip HTML tags/scripts/styles down to readable text (lightweight, no extra deps)
    const text = raw
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.slice(0, maxChars);
  } catch (err: any) {
    console.warn(`Failed to fetch URL ${url}:`, err?.message || err);
    return `[Could not fetch ${url} — ${err?.message || "unknown error"}]`;
  }
}

async function fetchAllUrls(urlsRaw: string | undefined): Promise<string> {
  if (!urlsRaw || !urlsRaw.trim()) return "None";

  const urls = urlsRaw
    .split(/[\n\s]+/)
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u))
    .slice(0, 5); // cap to 5 URLs to keep prompt size/time sane

  if (urls.length === 0) return "None";

  const results = await Promise.all(
    urls.map(async (url) => {
      const content = await fetchUrlContent(url);
      return `--- Content from ${url} ---\n${content}\n`;
    })
  );

  return results.join("\n");
}

// ---------------------------------------------------------------------------
// Shared response schema for the action plan (used by both generate & replan)
// ---------------------------------------------------------------------------
const planResponseSchema = {
  type: Type.OBJECT,
  properties: {
    panicAlertLevel: {
      type: Type.STRING,
      description: "Must be 'high' if panic level is >= 7, or 'normal' otherwise.",
    },
    comfortingIntro: {
      type: Type.STRING,
      description:
        "A very brief, powerful, calming statement tailored to their panic level. E.g. 'Take a deep breath. We have 18 hours, and here is your exact minute-by-minute plan to survive.'",
    },
    triageCards: {
      type: Type.ARRAY,
      description:
        "The set of immediate step-by-step action blocks. If panic level is >= 7, each action inside must be ultra-short (10 words max), punchy, and highly actionable. No long paragraphs.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A simple unique slug or ID like 'step-1'." },
          phaseTitle: { type: Type.STRING, description: "Phase title, e.g. 'Phase 1: Damage Control'." },
          title: { type: Type.STRING, description: "Step title, e.g. 'Eliminate distractions & set timer'." },
          urgency: { type: Type.STRING, description: "Must be 'critical' (for high panic/immediate steps), 'important', or 'recommended'." },
          timeEstimate: { type: Type.STRING, description: "Estimated duration, e.g., '15 mins', '45 mins'." },
          actions: {
            type: Type.ARRAY,
            description: "An array of micro-bullet actions. Max 3 actions.",
            items: { type: Type.STRING },
          },
        },
        required: ["id", "phaseTitle", "title", "urgency", "timeEstimate", "actions"],
      },
    },
    proTips: {
      type: Type.ARRAY,
      description:
        "3-4 high-value bullet points for physical/mental stability (e.g., active recall strategies, water, sleep, Pomodoro, index cards). Keep them ultra-short if panic is high.",
      items: { type: Type.STRING },
    },
    stabilityGuidelines: {
      type: Type.ARRAY,
      description: "Exactly 4 unique, highly specific tactical tips/stability guidelines directly matching the user's input topic. The titles must be 1-2 words representing the tip (e.g., 'Dependency Check', 'Quick Sprints', 'Active Recall', 'Mind Space'). The text must be a short, highly practical recommendation (15-30 words max). Customize them specifically: if they are doing a coding task or hackathon, generate technical-sprint hints; if they are doing an exam, test or interview, generate memory-retention hints; otherwise generate context-specific productivity/mental-stability hints.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A very brief 1-2 word title, e.g., 'Sandbox Limit' or 'Anxiety Reset'" },
          text: { type: Type.STRING, description: "A punchy, highly actionable tactical tip or guideline (max 30 words)" },
        },
        required: ["title", "text"],
      },
    },
  },
  required: ["panicAlertLevel", "comfortingIntro", "triageCards", "proTips", "stabilityGuidelines"],
};

const varietyAngles = [
  "Frame your examples and wording slightly differently than a typical textbook would — avoid the most predictable, first-thing-that-comes-to-mind example for each concept.",
  "Pick varied, less obvious illustrative examples for each concept where possible, while staying accurate and beginner-friendly.",
  "Avoid reusing the exact same stock phrasing or examples you might use for similar topics — keep wording fresh and specific to this exact request.",
];

function pickVarietyAngle(): string {
  return varietyAngles[Math.floor(Math.random() * varietyAngles.length)];
}

// Parses/validates a Gemini JSON response, rejecting HTML/garbage output.
function parsePlanResponse(responseText: string | undefined) {
  if (!responseText) {
    throw new Error("Empty response from Gemini.");
  }
  const trimmedText = responseText.trim();
  const isHtml = trimmedText.toLowerCase().startsWith("<!doctype") || trimmedText.toLowerCase().startsWith("<html");
  if (isHtml) {
    throw new Error("Gemini returned HTML instead of JSON.");
  }
  return JSON.parse(trimmedText);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  function getAi(res: express.Response): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY environment variable");
      res.status(500).json({ error: "API key configuration is missing. Please set GEMINI_API_KEY in Secrets." });
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }

  // -------------------------------------------------------------------------
  // API Route: Generate Emergency Action Plan
  // -------------------------------------------------------------------------
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const { task, timeLeft, panicLevel, urls, files } = req.body;

      if (!task) {
        return res.status(400).json({ error: "Task description is required." });
      }

      const ai = getAi(res);
      if (!ai) return;

      // Actually fetch URL content now, instead of just dropping the raw link text in.
      const urlContent = await fetchAllUrls(urls);

      const promptParts: any[] = [];

      let promptText = `
User is panicking about a crucial task or exam:
"${task}"

Time left: ${timeLeft}
Current Panic Level: ${panicLevel}/10 (7 or above triggers EXTREME PANIC triage mode)

Context fetched from provided URLs (use this real content to tailor the plan; ignore lines starting with "[Could not fetch" or "[Skipped"):
${urlContent}
`;

      if (panicLevel >= 7) {
        promptText += `
CRITICAL INSTRUCTION:
The user is in a state of extreme panic (level >= 7).
Keep the comfortingIntro incredibly calm, brief, and highly structured.
Each triage step inside must be ultra-short (10 words max), punchy, and highly actionable. No long paragraphs.
Each triage step should focus on immediate containment, block setup, or dynamic tactical small-wins that boost momentum.
Keep the advice highly actionable and structured. Emphasize priority items.
`;
      } else {
        promptText += `
The user is in a state of moderate panic.
Keep the comfortingIntro highly supportive and reassuring.
Keep the advice highly actionable and structured. Emphasize priority items.
`;
      }

      promptText += `\n${pickVarietyAngle()}\n`;
      promptParts.push({ text: promptText });

      if (files && Array.isArray(files)) {
        for (const file of files) {
          if (file.base64 && file.mimeType) {
            let cleanBase64 = file.base64;
            const match = file.base64.match(/^data:.+;base64,(.*)$/);
            if (match) cleanBase64 = match[1];
            promptParts.push({ inlineData: { data: cleanBase64, mimeType: file.mimeType } });
          }
        }
      }

      const response = await generateWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: promptParts,
        config: {
          systemInstruction: `You are 'The Last-Minute Life Saver'—an expert academic, professional, and crisis triage assistant. 
Your goal is to parse the user's panic topic, remaining time, panic level, and any provided file/URL context to construct a flawless, high-contrast Emergency Action Plan.
Your advice must be highly specific, practical, and tailored to the exact topic and timeframe they entered.
Do not provide generic templates. If they have an exam on "Linear Algebra", target Linear Algebra concepts. If it is "Docker deployment", target Docker deployment.
If real URL content was provided, ground your plan in that actual content (e.g. real topics from a syllabus) rather than guessing.
Always structure your response strictly matching the specified JSON schema.`,
          responseMimeType: "application/json",
          temperature: 0.95,
          topP: 0.95,
          topK: 40,
          responseSchema: planResponseSchema,
        },
      });

      const parsedData = parsePlanResponse(response.text);
      return res.json(parsedData);
    } catch (error: any) {
      handlePlanError(error, res, "generating");
    }
  });

  // -------------------------------------------------------------------------
  // API Route: Re-plan based on progress (the "agentic" piece)
  // Takes the original task + which steps are done + time remaining now,
  // and asks Gemini to intelligently compress/reprioritize what's left.
  // -------------------------------------------------------------------------
  app.post("/api/replan", async (req, res) => {
    try {
      const { task, originalTimeLeft, timeRemainingNow, panicLevel, completedSteps, remainingSteps } = req.body;

      if (!task || !Array.isArray(remainingSteps)) {
        return res.status(400).json({
          error: "task and remainingSteps (array) are required for re-planning.",
        });
      }

      const ai = getAi(res);
      if (!ai) return;

      const completedSummary =
        Array.isArray(completedSteps) && completedSteps.length > 0
          ? completedSteps.map((s: any) => `- ${s.title || s}`).join("\n")
          : "None yet.";

      const remainingSummary = remainingSteps
        .map((s: any) => `- [${s.urgency || "unknown"}] ${s.phaseTitle || ""}: ${s.title || s}`)
        .join("\n");

      const promptText = `
The user is mid-way through an emergency action plan for:
"${task}"

Originally they had: ${originalTimeLeft}
Time remaining NOW: ${timeRemainingNow}
Current panic level: ${panicLevel}/10

Steps already COMPLETED (do not repeat or re-include these):
${completedSummary}

Steps still REMAINING from the original plan (these are candidates to keep, merge, compress, reorder, or cut):
${remainingSummary}

INSTRUCTION:
Given how much time is actually left now, intelligently REPLAN the remaining work. You may:
- Compress multiple remaining steps into fewer, tighter steps if time is short.
- Reorder remaining steps by urgency/impact given the new time constraint.
- Cut lower-value steps entirely if time does not allow them, and say so implicitly by omitting them.
- Keep momentum-building language given the user has already made progress — acknowledge progress briefly in the comfortingIntro.
Do NOT just repeat the original remaining steps unchanged — actually adapt to the new time budget.
${pickVarietyAngle()}
`;

      const response = await generateWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: [{ text: promptText }],
        config: {
          systemInstruction: `You are 'The Last-Minute Life Saver'—an adaptive crisis triage assistant.
You are re-planning an IN-PROGRESS emergency action plan based on real user progress and updated remaining time.
Be realistic: if time has shrunk a lot, ruthlessly compress and cut. If the user is ahead of schedule, you may add a touch more depth.
Always structure your response strictly matching the specified JSON schema.`,
          responseMimeType: "application/json",
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          responseSchema: planResponseSchema,
        },
      });

      const parsedData = parsePlanResponse(response.text);
      return res.json(parsedData);
    } catch (error: any) {
      handlePlanError(error, res, "re-planning");
    }
  });

  // -------------------------------------------------------------------------
  // API Route: Export plan as a downloadable .ics calendar file
  // Expects { task, triageCards: [{ title, timeEstimate, phaseTitle }] }
  // Schedules steps sequentially starting from "now".
  // -------------------------------------------------------------------------
  app.post("/api/export-ics", (req, res) => {
    try {
      const { task, triageCards } = req.body;

      if (!Array.isArray(triageCards) || triageCards.length === 0) {
        return res.status(400).json({ error: "triageCards array is required." });
      }

      const toIcsDate = (d: Date) =>
        d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      const parseMinutes = (timeEstimate: string): number => {
        if (!timeEstimate) return 30;
        const hourMatch = timeEstimate.match(/([\d.]+)\s*hour/i);
        const minMatch = timeEstimate.match(/([\d.]+)\s*min/i);
        let minutes = 0;
        if (hourMatch) minutes += parseFloat(hourMatch[1]) * 60;
        if (minMatch) minutes += parseFloat(minMatch[1]);
        return minutes > 0 ? Math.round(minutes) : 30;
      };

      let cursor = new Date(Date.now() + 5 * 60 * 1000); // start 5 min from now
      const events: string[] = [];

      for (const card of triageCards) {
        const durationMin = parseMinutes(card.timeEstimate);
        const start = new Date(cursor);
        const end = new Date(cursor.getTime() + durationMin * 60 * 1000);
        cursor = end;

        const summary = `${card.phaseTitle ? card.phaseTitle + ": " : ""}${card.title || "Action step"}`;
        const description = Array.isArray(card.actions) ? card.actions.join("\\n") : "";

        events.push(
          [
            "BEGIN:VEVENT",
            `UID:${card.id || Math.random().toString(36).slice(2)}@last-minute-life-saver`,
            `DTSTAMP:${toIcsDate(new Date())}`,
            `DTSTART:${toIcsDate(start)}`,
            `DTEND:${toIcsDate(end)}`,
            `SUMMARY:${summary.replace(/\n/g, " ")}`,
            `DESCRIPTION:${description}`,
            "END:VEVENT",
          ].join("\r\n")
        );
      }

      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Last-Minute Life Saver//EN",
        `X-WR-CALNAME:${(task || "Emergency Plan").replace(/\n/g, " ")}`,
        ...events,
        "END:VCALENDAR",
      ].join("\r\n");

      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="last-minute-plan.ics"');
      return res.send(icsContent);
    } catch (error: any) {
      console.error("Error exporting .ics:", error);
      return res.status(500).json({ error: "Failed to generate calendar file." });
    }
  });

  function handlePlanError(error: any, res: express.Response, action: string) {
    const status = error?.error?.code || error?.status || 500;
    const message = error?.error?.message || error?.message || `Unknown error ${action} the emergency action plan.`;

    console.error(`Error ${action} emergency action plan:`, error);

    if (status === 503 || error?.error?.status === "UNAVAILABLE") {
      return res.status(503).json({
        error: "Gemini is currently experiencing high demand. We retried automatically — please try again in a moment.",
      });
    }

    return res.status(typeof status === "number" ? status : 500).json({
      error: `Something went wrong ${action} your plan: ${message}`,
    });
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
