import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Flame, ShieldAlert, Sparkles, Clock, Brain, Coffee, RefreshCw, FileText, Check, RotateCcw, AlertCircle, AlertOctagon, Paperclip, Link, X, Send, Image, Code, Triangle, Menu, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActionPlan, UploadedFile, HistoryEntry, TriageCard } from "./types";
import PlanViewer from "./components/PlanViewer";

// Dynamic fallback emergency action plan generator structured perfectly matching the JSON schema
function getFallbackPlan(userTask: string, files: UploadedFile[] = []): ActionPlan {
  const normalizedTask = (userTask || "").toLowerCase();
  
  // Dynamic Semantic Topic Synthesizer - acts as an advanced strategy planner
  function synthesizeTopic(input: string): string {
    const clean = input.trim();
    if (!clean) return "Operational Strategy Plan";
    
    // Clean up typical filler phrases
    let synthesized = clean
      .replace(/^(how to|i need to|help me|write a|make a|code a|prepare a|design a|set up a|do my|study for|prepare for|run a|launch a|submit my|develop a|build a)\s+/gi, "")
      .trim();
    
    // Capitalize words beautifully
    synthesized = synthesized.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    
    if (synthesized.length > 50) {
      synthesized = synthesized.substring(0, 47) + "...";
    }
    return synthesized || "Urgent Objective Plan";
  }

  const synthesizedTopic = synthesizeTopic(userTask);

  // Vocabulary & Synonym Scrambler for high variance (total text variation)
  const synonyms: { [key: string]: string[] } = {
    "Initialize": ["Initialize", "Configure", "Set up", "Prepare", "Establish", "Launch", "Boot up", "Ready", "Structure"],
    "Set up": ["Set up", "Configure", "Establish", "Prepare", "Ready", "Activate", "Coordinate"],
    "Identify": ["Identify", "Pinpoint", "Isolate", "Locate", "Extract", "Analyze", "Determine"],
    "Isolate": ["Isolate", "Lock down", "Separate", "Shield", "Secure", "Filter out"],
    "Build": ["Build", "Implement", "Develop", "Construct", "Assemble", "Draft", "Forge", "Engineer"],
    "Draft": ["Draft", "Write", "Sketch out", "Outline", "Formulate", "Prototype"],
    "Verify": ["Verify", "Double-check", "Check", "Audit", "Validate", "Review", "Inspect", "Test"],
    "Polish": ["Polish", "Refine", "Tweak", "Optimize", "Perfect", "Enhance", "Streamline"],
    "Submit": ["Submit", "Ship", "Deliver", "Upload", "Transmit", "Push", "Present"],
    "Review": ["Review", "Evaluate", "Go over", "Assess", "Analyze", "Scrutinize", "Examine"],
    "critical": ["critical", "absolutely core", "essential", "high-priority", "fundamental", "vital", "primary"]
  };

  function scrambleText(str: string): string {
    let result = str;
    for (const [key, list] of Object.entries(synonyms)) {
      const regex = new RegExp(`\\b${key}\\b`, "gi");
      result = result.replace(regex, () => {
        const randomWord = list[Math.floor(Math.random() * list.length)];
        if (key[0] === key[0].toUpperCase()) {
          return randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
        }
        return randomWord.toLowerCase();
      });
    }
    return result;
  }

  // Extract attached files or links names for context integration
  let resourceName = "";
  if (files && files.length > 0) {
    const primaryFile = files[0];
    if (primaryFile.contextType === 'url' && primaryFile.url) {
      try {
        const hostname = new URL(primaryFile.url).hostname;
        resourceName = hostname;
      } catch (e) {
        resourceName = primaryFile.name || "attached link";
      }
    } else {
      resourceName = primaryFile.name;
    }
  }

  // Dynamic Semantic Theme Classification
  // Count keyword frequencies to dynamically map to the correct structural pipeline
  const techKeywords = ["code", "bot", "deploy", "system", "api", "app", "server", "database", "git", "software", "development", "program", "build", "bug", "compile", "hackathon", "script", "frontend", "backend", "docker", "cloud", "aws", "react", "node", "typescript", "npm", "json"];
  const operationalKeywords = ["meeting", "client", "pitch", "presentation", "bill", "tax", "report", "corporate", "startup", "proposal", "business", "slide", "marketing", "budget", "finance", "invoice", "investor", "sales", "revenue", "partner"];
  const academicKeywords = ["exam", "study", "syllabus", "test", "quiz", "course", "paper", "homework", "assignment", "class", "grade", "lecture", "textbook", "chapter", "professor", "midterm", "finals", "algebra", "calculus", "notes"];
  const creativeKeywords = ["design", "write", "paint", "song", "draw", "video", "article", "draft", "book", "creative", "strategy", "logo", "music", "script", "content", "podcast", "novel", "illustration"];

  let techScore = 0;
  let operationalScore = 0;
  let academicScore = 0;
  let creativeScore = 0;

  techKeywords.forEach(k => { if (normalizedTask.includes(k)) techScore++; });
  operationalKeywords.forEach(k => { if (normalizedTask.includes(k)) operationalScore++; });
  academicKeywords.forEach(k => { if (normalizedTask.includes(k)) academicScore++; });
  creativeKeywords.forEach(k => { if (normalizedTask.includes(k)) creativeScore++; });

  let theme: 'tech' | 'operational' | 'academic' | 'creative' = 'creative';
  const maxScore = Math.max(techScore, operationalScore, academicScore, creativeScore);

  if (maxScore > 0) {
    if (maxScore === techScore) theme = 'tech';
    else if (maxScore === operationalScore) theme = 'operational';
    else if (maxScore === academicScore) theme = 'academic';
  } else {
    // If no keywords matched, default based on minor semantic hints or default to general/creative
    if (normalizedTask.includes("how") || normalizedTask.includes("make") || normalizedTask.includes("create")) theme = 'creative';
  }

  // Comforting Intro Box with high semantic variance
  const intros = [
    `AI core is currently operating under high load, but we've synthesized a highly customized, robust offline plan for "${synthesizedTopic}".`,
    `We have formulated a tactical, structured roadmap specifically tailored to secure outstanding success for "${synthesizedTopic}".`,
    `Take a deep breath. Your custom strategic guide is synchronized. Let's execute this action roadmap for "${synthesizedTopic}" step-by-step.`,
    `Our real-time triage engine has constructed an offline execution sequence specifically centered around your goal: "${synthesizedTopic}".`,
    `A calm mind executes flawlessly. Here is your strategic triage breakdown for "${synthesizedTopic}", optimized for performance.`
  ];
  const comfortingIntro = scrambleText(intros[Math.floor(Math.random() * intros.length)]);

  const triageCards: TriageCard[] = [];

  if (theme === 'tech') {
    const step1Actions = [
      "Initialize the local development environment, verify environment variable definitions, and bind server ports.",
      "Isolate critical system libraries and verify baseline third-party dependencies.",
      "Mute secondary visual notifications and lock down a dedicated coding console sandbox."
    ];
    if (resourceName) {
      step1Actions.unshift(`Parse and integrate the technical schema directly supplied inside ${resourceName}.`);
    }

    const step2Actions = [
      `Build the core functional skeleton, database adapters, and backend routing parameters for ${synthesizedTopic}.`,
      "Draft modular component files to prevent large token bottlenecks and enable swift localized testing.",
      "Establish offline mock variables or robust fallback endpoints to completely bypass network errors."
    ];
    if (resourceName) {
      step2Actions.push(`Verify interface component alignment with parameters compiled inside ${resourceName}.`);
    }

    const step3Actions = [
      "Run the compiler and test suites to audit baseline syntax errors and resolve unmapped references.",
      `Configure secure proxy settings to isolate and protect active credentials utilized in ${synthesizedTopic}.`,
      "Execute targeted validation runs against primary data handlers to secure extreme reliability."
    ];
    if (resourceName) {
      step3Actions.push(`Cross-verify core logic output against performance rules found in ${resourceName}.`);
    }

    const step4Actions = [
      "Verify production build parameters and ensure bundle compiles completely clean.",
      "Structure an explicit readme document detailing active launch parameters and local installation notes.",
      "Conduct a seamless 2-minute visual interface dry run to verify execution polish prior to submission."
    ];

    const finalStep1 = step1Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep2 = step2Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep3 = step3Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep4 = step4Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);

    triageCards.push(
      {
        id: "fallback-step-1",
        phaseTitle: scrambleText("PHASE 1: Technical Setup & Isolation"),
        title: scrambleText("Set up Sandbox & Define Technical Bounds"),
        urgency: "critical",
        timeEstimate: "20 mins",
        actions: finalStep1
      },
      {
        id: "fallback-step-2",
        phaseTitle: scrambleText("PHASE 2: Core Backbone Architecture"),
        title: scrambleText("Implement Central Core & Interface Layouts"),
        urgency: "critical",
        timeEstimate: "1 hour",
        actions: finalStep2
      },
      {
        id: "fallback-step-3",
        phaseTitle: scrambleText("PHASE 3: Code Validation & Integration"),
        title: scrambleText("Audit Endpoints & Debug Functional Flows"),
        urgency: "important",
        timeEstimate: "45 mins",
        actions: finalStep3
      },
      {
        id: "fallback-step-4",
        phaseTitle: scrambleText("PHASE 4: Deployment & Submission Runway"),
        title: scrambleText("Validate Build & Finalize Code Delivery"),
        urgency: "recommended",
        timeEstimate: "30 mins",
        actions: finalStep4
      }
    );
  } else if (theme === 'operational') {
    const step1Actions = [
      `Gather critical business briefs, regulatory files, and financial statements required for ${synthesizedTopic}.`,
      "Determine the single highest-value objective or decision required to lock in client authorization.",
      "Clear direct digital communication channels temporarily to secure a focused strategy environment."
    ];
    if (resourceName) {
      step1Actions.unshift(`Isolate specific operational benchmarks detailed in ${resourceName}.`);
    }

    const step2Actions = [
      `Structure the strategic slide skeleton or proposal blueprint for ${synthesizedTopic}.`,
      "Draft foundational headers, core value propositions, and primary deliverables.",
      "De-prioritize cosmetic pixel polishing; guarantee structural accuracy and visual readability first."
    ];
    if (resourceName) {
      step2Actions.push(`Map delivery parameters against raw metrics extracted from ${resourceName}.`);
    }

    const step3Actions = [
      "Review budget estimates, timeline constraints, and client objection parameters.",
      "Draft clear, executive responses to address core financial or compliance questions.",
      "Check nested spreadsheet formulas, numbers, and key tax structures for absolute precision."
    ];
    if (resourceName) {
      step3Actions.push(`Verify target objectives match requirements specified inside ${resourceName}.`);
    }

    const step4Actions = [
      `Run a timed simulation of the executive pitch or partner meeting flow for ${synthesizedTopic}.`,
      "Ensure all presentation credentials and spreadsheet share links possess correct public viewing permissions.",
      "Prepare a post-delivery followup form or call-to-action tracker to immediately lock in client commitment."
    ];

    const finalStep1 = step1Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep2 = step2Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep3 = step3Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep4 = step4Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);

    triageCards.push(
      {
        id: "fallback-step-1",
        phaseTitle: scrambleText("PHASE 1: Asset Gathering & Alignment"),
        title: scrambleText("Identify Core Objectives & Gather Inputs"),
        urgency: "critical",
        timeEstimate: "15 mins",
        actions: finalStep1
      },
      {
        id: "fallback-step-2",
        phaseTitle: scrambleText("PHASE 2: Strategic Content Outline"),
        title: scrambleText("Draft Proposal Skeleton & Core Delivery Slides"),
        urgency: "critical",
        timeEstimate: "45 mins",
        actions: finalStep2
      },
      {
        id: "fallback-step-3",
        phaseTitle: scrambleText("PHASE 3: Compliance & Risk Verification"),
        title: scrambleText("Review Financial Formulas & Operational Bounds"),
        urgency: "important",
        timeEstimate: "40 mins",
        actions: finalStep3
      },
      {
        id: "fallback-step-4",
        phaseTitle: scrambleText("PHASE 4: Executive Pitch Readiness"),
        title: scrambleText("Simulate Presentation Flow & Lock Permissions"),
        urgency: "recommended",
        timeEstimate: "30 mins",
        actions: finalStep4
      }
    );
  } else if (theme === 'academic') {
    const step1Actions = [
      "Prepare your mental workspace: lock out distractions, enable airplane mode, and trigger a focus clock.",
      `Determine the 3 high-probability academic topics or formulas representing 80% of testing value in ${synthesizedTopic}.`,
      "Gather high-yield summaries, previous quiz papers, and lecture outline files."
    ];
    if (resourceName) {
      step1Actions.push(`Verify vocabulary terms against lecture guides compiled inside ${resourceName}.`);
    }

    const step2Actions = [
      "Run a swift 80/20 information scrape across main textbook chapters and review manuals.",
      `Synthesize difficult formulas and definitions onto a single high-contrast index sheet for ${synthesizedTopic}.`,
      "Discard minor footnote details and obscure sub-topics to prevent cognitive overflow."
    ];
    if (resourceName) {
      step2Actions.unshift(`Analyze and study targeted notes direct from ${resourceName}.`);
    }

    const step3Actions = [
      `Deploy active blank-sheet recall: sketch out the entire ${synthesizedTopic} mental model from memory.`,
      "Teach the key concepts aloud to an imaginary beginner to expose remaining knowledge gaps.",
      "Solve 3-5 challenging multiple-choice or structural sample problems without looking at notes."
    ];
    if (resourceName) {
      step3Actions.push(`Verify question answers against keys provided inside ${resourceName}.`);
    }

    const step4Actions = [
      "Conduct a rapid, 10-minute visual review of the single consolidated formula sheet.",
      "Secure at least 5 hours of continuous rest to allow your brain to index and store these long-term concepts.",
      "Review your single-page summary card one last time immediately prior to entering the room."
    ];

    const finalStep1 = step1Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep2 = step2Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep3 = step3Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep4 = step4Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);

    triageCards.push(
      {
        id: "fallback-step-1",
        phaseTitle: scrambleText("PHASE 1: Cognitive Setup & Target Selection"),
        title: scrambleText("Isolate High-Yield Concepts & Lock Focus"),
        urgency: "critical",
        timeEstimate: "15 mins",
        actions: finalStep1
      },
      {
        id: "fallback-step-2",
        phaseTitle: scrambleText("PHASE 2: High-Impact Information Scrape"),
        title: scrambleText("Synthesize Formula Cheat Sheets & Key Rules"),
        urgency: "critical",
        timeEstimate: "45 mins",
        actions: finalStep2
      },
      {
        id: "fallback-step-3",
        phaseTitle: scrambleText("PHASE 3: Active Retrieval & Retrieval Practice"),
        title: scrambleText("Test Recall & Teach Complex Concepts Aloud"),
        urgency: "important",
        timeEstimate: "1 hour",
        actions: finalStep3
      },
      {
        id: "fallback-step-4",
        phaseTitle: scrambleText("PHASE 4: Mental Consolidation & Rest Protocol"),
        title: scrambleText("Secure Synapse Indexing & Rapid Cheat Run"),
        urgency: "recommended",
        timeEstimate: "45 mins",
        actions: finalStep4
      }
    );
  } else {
    // Creative & General Task Blueprint
    const step1Actions = [
      `Isolate the precise, singular deliverable that defines successful completion for ${synthesizedTopic}.`,
      "Eradicate setup friction by writing down the absolute first physical step of execution.",
      "Set up your physical desk, close secondary apps, and establish a 30-minute high-focus countdown."
    ];
    if (resourceName) {
      step1Actions.unshift(`Review creative constraints and parameters provided in ${resourceName}.`);
    }

    const step2Actions = [
      `Draft a rapid skeleton mockup, design outline, or raw text structure for ${synthesizedTopic}.`,
      "Ignore formatting details and minor grammar blocks during the high-speed skeleton drafting.",
      "Utilize explicit brackets or bold tags to mark unresearched details without breaking creative momentum."
    ];
    if (resourceName) {
      step2Actions.push(`Map design elements against criteria found inside ${resourceName}.`);
    }

    const step3Actions = [
      `Flesh out central elements of ${synthesizedTopic} following your high-speed layout draft.`,
      "Cross-check active progress against completion targets and excise secondary, non-essential clutter.",
      "Refine visual hierarchy, focal points, and interface transitions to elevate professional design quality."
    ];
    if (resourceName) {
      step3Actions.push(`Conduct a final quality checklist match with details from ${resourceName}.`);
    }

    const step4Actions = [
      "Perform a rigorous final formatting, spelling, or layout proofreading sweep.",
      "Export a clean, fully compiled, offline-persisted local master copy of your work.",
      "Ship the finished package with absolute confidence; on-time execution beats infinite late polishing."
    ];

    const finalStep1 = step1Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep2 = step2Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep3 = step3Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalStep4 = step4Actions.map(scrambleText).sort(() => 0.5 - Math.random()).slice(0, 3);

    triageCards.push(
      {
        id: "fallback-step-1",
        phaseTitle: scrambleText("PHASE 1: Definition & Sandbox Isolation"),
        title: scrambleText("Define Completion Goals & Eliminate Workspace Friction"),
        urgency: "critical",
        timeEstimate: "10 mins",
        actions: finalStep1
      },
      {
        id: "fallback-step-2",
        phaseTitle: scrambleText("PHASE 2: Structural Outline & Draft Skeleton"),
        title: scrambleText("Generate High-Speed Visual or Written Outline"),
        urgency: "critical",
        timeEstimate: "45 mins",
        actions: finalStep2
      },
      {
        id: "fallback-step-3",
        phaseTitle: scrambleText("PHASE 3: Core Iteration & Design Polish"),
        title: scrambleText("Refine Major Details & Remove Non-Essential Clutter"),
        urgency: "important",
        timeEstimate: "1 hour",
        actions: finalStep3
      },
      {
        id: "fallback-step-4",
        phaseTitle: scrambleText("PHASE 4: Final Quality Sweep & Delivery"),
        title: scrambleText("Export Clean Package & Commit Submission"),
        urgency: "recommended",
        timeEstimate: "30 mins",
        actions: finalStep4
      }
    );
  }

  // Generate highly robust, non-static, customized proTips list matching the theme
  let proTipsList: string[] = [];
  if (theme === 'tech') {
    proTipsList = [
      "Initialize baseline coding dependencies prior to writing any high-level API features.",
      "Structure your application into modular blocks to completely prevent large file bottlenecks.",
      "Focus heavily on responsive UI feedback loops and subtle micro-interactions for a polished experience.",
      "Verify that secrets are isolated behind server-side routes and never exposed to public repositories."
    ];
  } else if (theme === 'operational') {
    proTipsList = [
      "Review your strategic slide layout or briefing checklist for extreme visual clarity.",
      "Double-check all shared link and file permission settings in an incognito window.",
      "Lock in a 10-minute quiet buffer prior to presentation start to mentally reset.",
      "Practice your core strategic executive talking points aloud twice to establish speaking cadence."
    ];
  } else if (theme === 'academic') {
    proTipsList = [
      "Utilize active retrieval: write down retrieved concepts completely from memory without referencing sheets.",
      "Focus intensely on high-yield syllabus objectives identified in past tests or sample outlines.",
      "Secure at least 5 hours of continuous rest to allow the hippocampus to index information.",
      "Teach complex formulas or historical cases aloud to consolidate neural recall pathways."
    ];
  } else {
    proTipsList = [
      "Pinpoint the single high-impact creative milestone that simplifies secondary tasks.",
      "Construct a highly detailed outline to bypass the blank page creative block.",
      "Work in solid, uninterrupted 30-minute intervals with active physical movement breaks.",
      "Commit to functional delivery: 80% polished and submitted is infinitely superior to perfect but late."
    ];
  }

  const scrambledProTips = proTipsList.map(scrambleText).sort(() => 0.5 - Math.random());

  // Collection pool of at least 15 completely distinct professional, academic, and mental-stability tips
  const offlineTipsPool = [
    { title: "Dependency Check", text: "Verify that all required environment variables and core library dependencies are correctly defined before compiling any code." },
    { title: "Active Recall", text: "Force yourself to write down central concepts on a blank page from memory before consulting your reference material." },
    { title: "Box Breathing", text: "Inhale deeply for 4 seconds, hold for 4, exhale for 4, and hold for 4 to down-regulate your nervous system immediately." },
    { title: "Quick Compile", text: "Run compilation and syntax checkers in small, iterative stages rather than waiting for massive file additions." },
    { title: "Physiological Sigh", text: "Take two rapid inhales through the nose followed by one slow, sighing exhale to drop heart rate and anxiety." },
    { title: "Feynman Technique", text: "Explain the core bottleneck of your project aloud to an imaginary child or beginner to expose logical gaps." },
    { title: "Task Isolation", text: "Mute every device, close social channels, and focus exclusively on a single sub-task for 20 minutes." },
    { title: "Carb Avoidance", text: "Steer clear of insulin-spiking simple sugars and opt for stable proteins to preserve high cognitive stamina." },
    { title: "Minimum Viable", text: "Focus entirely on securing a crude, functional skeleton first. Ruthlessly defer secondary style polishing." },
    { title: "Milestone Map", text: "Separate the next two hours into four distinct 25-minute sprints with rigid milestone checkpoints." },
    { title: "Syllabus Snipe", text: "Identify the top three objectives on the study guide that account for 80% of the graded points." },
    { title: "Workspace Purge", text: "Clear everything except a single glass of water and your active device off your physical desk surface." },
    { title: "Micro Reset", text: "Step completely away from all screens and stand up to walk for 3 minutes to restore background mental processing." },
    { title: "Flashcard Drill", text: "Run rapid, self-testing cycles using index cards or active recall sheets rather than passive textbook rereading." },
    { title: "Pomodoro Burst", text: "Commit to a high-intensity 25-minute sprint followed by a strictly structured 5-minute cognitive rest." },
    { title: "Commit Early", text: "Save and back up your stable files locally. Frequent small updates prevent devastating recovery delays." },
    { title: "Hydration Boost", text: "Sip cold water steadily. Mild dehydration degrades concentration and information retrieval speed by 15%." }
  ];

  // Guarantee that no two successive generations display the same advice
  let lastSelectedTitles: string[] = [];
  try {
    const saved = localStorage.getItem("last_selected_guideline_titles");
    if (saved) {
      lastSelectedTitles = JSON.parse(saved);
    }
  } catch (e) {
    // Ignore
  }

  let availablePool = offlineTipsPool.filter(tip => !lastSelectedTitles.includes(tip.title));
  if (availablePool.length < 4) {
    availablePool = offlineTipsPool;
  }

  // Shuffle and select 4 different cards
  const shuffledTips = [...availablePool].sort(() => Math.random() - 0.5);
  const selectedGuidelines = shuffledTips.slice(0, 4);

  try {
    localStorage.setItem("last_selected_guideline_titles", JSON.stringify(selectedGuidelines.map(g => g.title)));
  } catch (e) {
    // Ignore
  }

  return {
    panicAlertLevel: "high",
    comfortingIntro,
    triageCards,
    proTips: scrambledProTips,
    stabilityGuidelines: selectedGuidelines
  };
}

export default function App() {
  // Input form state
  const [task, setTask] = useState("");
  const [timeLeft, setTimeLeft] = useState("Under 24 hours (Extreme Triage)");
  const [panicLevel, setPanicLevel] = useState(5);
  const [urls, setUrls] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Premium Chat History State
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem("last_minute_saver_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history from LocalStorage:", e);
      return [];
    }
  });
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Habit/pattern tracking — derived from existing session history, surfaces
  // recurring crunch patterns (frequency, avg panic, common timeframe).
  const habitStats = React.useMemo(() => {
    if (!history || history.length === 0) return null;
    const totalPlans = history.length;
    const avgPanic =
      history.reduce((sum, h) => sum + (h.panicLevel || 0), 0) / totalPlans;
    const mostCommonTimeframe = (() => {
      const counts: Record<string, number> = {};
      history.forEach((h) => {
        counts[h.timeLeft] = (counts[h.timeLeft] || 0) + 1;
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    })();

    return { totalPlans, avgPanic: avgPanic.toFixed(1), mostCommonTimeframe };
  }, [history]);

  // UI state for Consolidated Conversational Attachment style
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachmentInputMode, setAttachmentInputMode] = useState<'url' | 'gdrive' | null>(null);
  const [attachmentInputValue, setAttachmentInputValue] = useState("");

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Generation state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  // Tracks which triage step IDs the user has checked off — drives /api/replan
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());
  const [replanning, setReplanning] = useState(false);
  const [exportingIcs, setExportingIcs] = useState(false);

  // Handle outside click to auto-dismiss attachment popover menu
  useEffect(() => {
    if (!showAttachmentMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".attachment-menu-container")) {
        setShowAttachmentMenu(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showAttachmentMenu]);

  // History Tracking Logic - Save title, timestamp, and generated plan data
  const addToHistory = (generatedPlan: ActionPlan, simulatedFlag: boolean, taskText: string) => {
    try {
      const trimmedTaskText = taskText.trim();
      const title = trimmedTaskText.substring(0, 25) + (trimmedTaskText.length > 25 ? "..." : "");
      const newEntry: HistoryEntry = {
        id: "hist-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
        task: trimmedTaskText,
        timeLeft,
        panicLevel,
        files: [...files],
        plan: generatedPlan,
        isSimulated: simulatedFlag
      };

      setHistory(prev => {
        const updated = [newEntry, ...prev];
        localStorage.setItem("last_minute_saver_history", JSON.stringify(updated));
        return updated;
      });
      setSelectedHistoryId(newEntry.id);
    } catch (e) {
      console.error("Failed to add entry to history:", e);
    }
  };

  // Interactive Session Loading
  const handleSelectHistoryEntry = (entry: HistoryEntry) => {
    setTask(entry.task);
    setTimeLeft(entry.timeLeft);
    setPanicLevel(entry.panicLevel);
    setFiles(entry.files);
    setPlan(entry.plan);
    setIsSimulated(entry.isSimulated);
    setSelectedHistoryId(entry.id);
    setErrorMessage(null);
    // On mobile, close sidebar automatically
    setSidebarOpen(false);
  };

  // Delete specific history entry
  const handleDeleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering select
    setHistory(prev => {
      const updated = prev.filter(entry => entry.id !== id);
      localStorage.setItem("last_minute_saver_history", JSON.stringify(updated));
      return updated;
    });
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
    }
  };

  // Reset to a clean, blank request
  const handleNewTriage = () => {
    setTask("");
    setTimeLeft("Under 24 hours (Extreme Triage)");
    setPanicLevel(5);
    setFiles([]);
    setPlan(null);
    setIsSimulated(false);
    setErrorMessage(null);
    setSelectedHistoryId(null);
    setSidebarOpen(false);
    setCompletedStepIds(new Set());
  };

  // Keep the string-serialized URL field in sync for backend/historical handlers
  useEffect(() => {
    const serializedUrls = files
      .filter(f => f.contextType === 'url' || f.contextType === 'gdrive')
      .map(f => f.url || f.name)
      .join("\n");
    setUrls(serializedUrls);
  }, [files]);

  // Unified File Attachments Handler (Media or Code/Files)
  const handleAttachmentFileChange = (e: React.ChangeEvent<HTMLInputElement>, contextType: 'media' | 'code') => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          const uploaded: UploadedFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            mimeType: file.type,
            base64: base64String,
            contextType: contextType,
          };
          setFiles(prev => {
            if (prev.some(f => f.name === file.name)) return prev;
            return [...prev, uploaded];
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Form submission / validation and API trigger on Enter (without shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Fun phrases and subtexts for the dynamic panic-level descriptors
  const getPanicDescriptor = (level: number) => {
    if (level <= 3) {
      return {
        text: "Chill Breeze",
        color: "text-emerald-400 font-bold",
        bg: "bg-emerald-500/10 border-emerald-500/35",
        desc: "Mint Green Status: You are mostly calm, seeking an optimal, structured roadmap to finish."
      };
    }
    if (level <= 7) {
      return {
        text: "Sweating Bullets",
        color: "text-amber-400 font-bold",
        bg: "bg-amber-500/10 border-amber-500/35",
        desc: "Amber Yellow Alert: Adrenaline rising. Block all external notifications and lock down focus."
      };
    }
    return {
      text: "APOCALYPSE NOW",
      color: "text-red-500 font-black animate-pulse",
      bg: "bg-red-500/20 border-red-500/55 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
      desc: "🚨 Ruby Red Emergency: Extreme panic mode active. Suppression of all non-essential paragraphs initialized."
    };
  };

  // Fun cycles of loading steps to soothe the user
  const loadingSteps = [
    "Establishing encrypted connection to Crisis Triage AI...",
    "Analyzing panic levels & remaining duration...",
    "Scanning loaded lecture materials, PDFs, and links...",
    "Suppressing non-essential cognitive load & paragraphs...",
    "Synthesizing high-contrast, action-oriented step list...",
    "Generating Emergency Survival Roadmap..."
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingSteps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!task.trim()) {
      setErrorMessage("Please tell us what crucial task or exam is causing you to panic!");
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setErrorMessage(null);
    setPlan(null);
    setIsSimulated(false);

    const serializedUrls = urls;

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          task,
          timeLeft,
          panicLevel,
          urls: serializedUrls,
          files
        })
      });

      const text = await response.text();
      const trimmedText = text.trim();
      const isHtmlResponse = trimmedText.startsWith("<");

      // Determine the real nature of the failure instead of always assuming "demand".
      // - 4xx (e.g. missing task) = a real, fixable client error -> show it plainly, NO fake fallback.
      // - 5xx / network / non-JSON body = genuine outage -> fallback is appropriate.
      if (!response.ok || isHtmlResponse) {
        let errorMessageDetail = "Something went wrong generating your plan.";
        let isClientError = false;

        if (!isHtmlResponse) {
          try {
            const errorData = JSON.parse(trimmedText);
            if (errorData.error) errorMessageDetail = errorData.error;
          } catch {
            // leave default message
          }
        }

        isClientError = response.status >= 400 && response.status < 500;

        if (isClientError) {
          // Real, actionable error (e.g. validation failure). Do NOT fake a plan.
          setErrorMessage(errorMessageDetail);
          setPlan(null);
          setIsSimulated(false);
          return;
        }

        // Genuine server-side/outage condition (5xx, HTML error page, etc.)
        throw new Error(errorMessageDetail);
      }

      let data;
      try {
        data = JSON.parse(trimmedText);
      } catch (err3) {
        // Response claimed to be OK but body wasn't valid JSON — treat as a real bug,
        // not silently as "demand". Surface it and do NOT fake a plan.
        console.error("Received 200 OK but body was not valid JSON:", trimmedText.slice(0, 300));
        setErrorMessage(
          "The server returned an unexpected response. This looks like a bug rather than high demand — please check the server logs."
        );
        setPlan(null);
        setIsSimulated(false);
        return;
      }

      setPlan(data);
      setIsSimulated(false);
      addToHistory(data, false, task);
    } catch (err: any) {
      // Reaching here means a genuine transient/outage condition (network failure,
      // 5xx, or HTML error page) — NOT a client validation error. Fallback is appropriate here.
      console.error("Transient/outage error generating plan, using offline fallback:", err);

      const dynamicFallback = getFallbackPlan(task, files);
      setPlan(dynamicFallback);
      setIsSimulated(true);
      addToHistory(dynamicFallback, true, task);

      setErrorMessage(
        `${err?.message || "The AI service is temporarily unavailable."} ⚠️ This plan was NOT generated by AI — Gemini was unreachable, so a basic offline template is shown instead. Try again shortly for a real AI-tailored plan.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle a step's completed state, used by PlanViewer checkboxes.
  // PlanViewer should call this (passed down as a prop) instead of managing
  // its own local-only checkbox state, so progress can drive re-planning.
  const handleToggleStep = (stepId: string) => {
    setCompletedStepIds(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  // Adaptive re-plan: sends completed vs remaining steps + current time
  // budget to /api/replan so Gemini can compress/reorder/cut what's left.
  const handleReplan = async (timeRemainingNow: string) => {
    if (!plan || isSimulated) {
      setErrorMessage("Re-planning isn't available for offline/simulated plans — please generate a real plan first.");
      return;
    }

    const completedSteps = plan.triageCards.filter(c => completedStepIds.has(c.id));
    const remainingSteps = plan.triageCards.filter(c => !completedStepIds.has(c.id));

    if (remainingSteps.length === 0) {
      setErrorMessage("Looks like you've completed every step already — nothing left to re-plan!");
      return;
    }

    setReplanning(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/replan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          originalTimeLeft: timeLeft,
          timeRemainingNow,
          panicLevel,
          completedSteps,
          remainingSteps
        })
      });

      const text = await response.text();
      const trimmedText = text.trim();

      if (!response.ok) {
        let detail = "Failed to re-plan. Please try again.";
        try {
          const errData = JSON.parse(trimmedText);
          if (errData.error) detail = errData.error;
        } catch {
          // keep default
        }
        setErrorMessage(detail);
        return;
      }

      const newPlan: ActionPlan = JSON.parse(trimmedText);

      // Keep completed steps visible/checked by merging them back in ahead of
      // the freshly replanned remaining steps, so progress isn't lost visually.
      // We ensure there are no duplicate keys (e.g. "step-1" colliding between completed and newly generated steps).
      const mergedCards: TriageCard[] = [];
      const seenIds = new Set<string>();

      for (const card of completedSteps) {
        seenIds.add(card.id);
        mergedCards.push(card);
      }

      for (let i = 0; i < newPlan.triageCards.length; i++) {
        const card = newPlan.triageCards[i];
        let targetId = card.id;
        let counter = 1;
        while (seenIds.has(targetId)) {
          targetId = `${card.id}-replan-${counter}`;
          counter++;
        }
        seenIds.add(targetId);
        mergedCards.push({
          ...card,
          id: targetId
        });
      }

      const mergedPlan: ActionPlan = {
        ...newPlan,
        triageCards: mergedCards
      };

      setPlan(mergedPlan);
    } catch (err: any) {
      console.error("Re-plan error:", err);
      setErrorMessage(err?.message || "Failed to re-plan — please try again in a moment.");
    } finally {
      setReplanning(false);
    }
  };

  // Export the current plan's triage cards as a downloadable .ics calendar file.
  const handleExportIcs = async () => {
    if (!plan || !plan.triageCards || plan.triageCards.length === 0) {
      setErrorMessage("There's no active plan to export yet.");
      return;
    }

    setExportingIcs(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/export-ics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, triageCards: plan.triageCards })
      });

      if (!response.ok) {
        const text = await response.text();
        let detail = "Failed to export calendar file.";
        try {
          const errData = JSON.parse(text);
          if (errData.error) detail = errData.error;
        } catch {
          // keep default
        }
        setErrorMessage(detail);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "last-minute-plan.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Export .ics error:", err);
      setErrorMessage(err?.message || "Failed to export calendar file — please try again.");
    } finally {
      setExportingIcs(false);
    }
  };

  // Request notification permission once a plan exists
  useEffect(() => {
    if (plan && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [plan]);

  // Schedule a browser notification for each phase's estimated end time,
  // nudging the user to move to the next phase. Re-runs whenever the plan
  // changes (including after a re-plan), and clears old timers first.
  useEffect(() => {
    if (!plan || !("Notification" in window)) return;

    const timers: number[] = [];
    const parseMinutes = (timeEstimate: string): number => {
      if (!timeEstimate) return 30;
      const hourMatch = timeEstimate.match(/([\d.]+)\s*hour/i);
      const minMatch = timeEstimate.match(/([\d.]+)\s*min/i);
      let minutes = 0;
      if (hourMatch) minutes += parseFloat(hourMatch[1]) * 60;
      if (minMatch) minutes += parseFloat(minMatch[1]);
      return minutes > 0 ? Math.round(minutes) : 30;
    };

    let cursorMs = 0;
    plan.triageCards.forEach((card) => {
      const durationMs = parseMinutes(card.timeEstimate) * 60 * 1000;
      cursorMs += durationMs;

      const timerId = window.setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("⏰ Time to move on", {
            body: `"${card.title}" should be done now. Time for: ${card.phaseTitle}`,
            icon: "/favicon.ico",
          });
        }
      }, cursorMs);

      timers.push(timerId);
    });

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [plan]);

  const clearPlan = () => {
    if (confirm("Are you sure you want to clear your current action plan?")) {
      setPlan(null);
      setTask("");
      setTimeLeft("Under 24 hours (Extreme Triage)");
      setPanicLevel(5);
      setUrls("");
      setFiles([]);
      setIsSimulated(false);
      setCompletedStepIds(new Set());
    }
  };

  const panicData = getPanicDescriptor(panicLevel);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-red-500/30 selection:text-red-200 flex">
      
      {/* Drawer Backdrop Overlay (on all screens) */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
        />
      )}

      {/* Premium Collapsible Slide-Out Right-Side History Panel */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-80 bg-[#0c0c0e]/98 backdrop-blur-md border-l border-zinc-800/60 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        {/* Drawer Header */}
        <div className="p-4.5 border-b border-zinc-800/40 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="font-semibold text-sm tracking-tight text-zinc-200">Crisis History & Recurring Patterns</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer "New Triage" button */}
        <div className="p-4 border-b border-zinc-800/20">
          <button
            onClick={handleNewTriage}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-lg shadow-red-600/15 cursor-pointer uppercase tracking-wider font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>New Triage</span>
          </button>
        </div>

        {/* Recent Plans Scroll List */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {habitStats && (
            <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 mb-3 mx-1 text-xs text-zinc-400 space-y-1">
              <p className="font-mono uppercase tracking-wide text-zinc-300 mb-1">Your Crisis Patterns</p>
              <p>📊 {habitStats.totalPlans} crunch sessions tracked</p>
              <p>🔥 Avg panic level: {habitStats.avgPanic}/10</p>
              <p>⏱️ Most common timeframe: {habitStats.mostCommonTimeframe}</p>
            </div>
          )}
          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-600 font-mono leading-relaxed">
              No recent roadmaps.<br />Generate a plan to start your history log.
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleSelectHistoryEntry(entry)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 border ${
                  selectedHistoryId === entry.id
                    ? "bg-red-500/10 border-red-500/30 text-red-200 shadow-[inset_0_0_8px_rgba(239,68,68,0.05)]"
                    : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-xs font-semibold truncate leading-snug">{entry.title}</p>
                  <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{entry.timestamp}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteHistoryEntry(entry.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                  title="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Panel Column */}
      <div className="flex-1 min-h-screen flex flex-col overflow-y-auto relative">
        
        {/* Visual Accent Top Bar */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-purple-600 to-emerald-500 shadow-[0_2px_10px_rgba(239,68,68,0.2)]" />

        {/* Top Control Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-zinc-900/60 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-red-500 shrink-0 animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-red-500 font-mono">
              CRUNCH CO-PILOT
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* New Triage Action Button */}
            <div className="relative group">
              <button
                onClick={handleNewTriage}
                className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-red-600/10 flex items-center justify-center w-9 h-9"
                title="New Triage"
              >
                <Plus className="w-5 h-5" />
              </button>
              <div className="absolute top-full right-0 mt-2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-40 shadow-xl font-mono leading-none">
                New Triage
              </div>
            </div>
            
            {/* History Toggle Button */}
            <div className="relative group">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center relative w-9 h-9 ${
                  sidebarOpen 
                    ? "bg-red-500/10 border-red-500/30 text-red-400" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
                title="Recent History"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="absolute top-full right-0 mt-2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-40 shadow-xl font-mono leading-none">
                Recent History
              </div>
            </div>
          </div>
        </div>

        {/* Header Container */}
        <header className="max-w-5xl mx-auto px-4 pt-8 pb-4 text-center space-y-3">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-red-400 font-bold tracking-wider">CRISIS MANAGEMENT UNIT</span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
          Crunch Co-Pilot
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-zinc-400 font-medium leading-relaxed">
          Stressed? Overflowing workload? Missing commitments? Paste your project details, meeting agendas, project specs, or link references, choose your timeline, and receive a high-contrast, action-first roadmap to secure your deadline.
        </p>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pb-20 space-y-12">
          {/* Input Block Module */}
        <section className="bg-white/[0.02] backdrop-blur-[12px] border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-300">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Consolidated Premium Chat-Style Input Console */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label htmlFor="task-input" className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500 shrink-0" />
                  What crucial task, deadline, meeting, bill payment, or interview are you panicking about right now?
                </label>
                <span className="text-[10px] font-mono text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">REQUIRED</span>
              </div>
              
              <div className="relative border border-white/10 rounded-2xl bg-zinc-950/45 p-3.5 focus-within:ring-1 focus-within:ring-red-500/30 focus-within:border-red-500/30 transition-all duration-300">
                <textarea
                  id="task-input"
                  required
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What crucial task, deadline, meeting, bill payment, or interview are you panicking about right now?"
                  className="w-full min-h-[120px] bg-transparent border-none text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0 p-1 resize-y leading-relaxed"
                />

                {/* Active Chips Row (for uploaded files & links with diverse pill styling) */}
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-1 pb-3 pt-2.5 border-t border-white/5">
                    {files.map((file, idx) => {
                      let cType = file.contextType;
                      if (!cType) {
                        const isImg = file.type?.startsWith("image/") || file.type?.startsWith("video/");
                        cType = isImg ? "media" : "code";
                      }

                      // Choose styling & icon based on type
                      let icon = <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
                      let pillStyle = "bg-blue-500/10 border-blue-500/20 text-blue-300 hover:border-blue-500/30";

                      if (cType === "media") {
                        icon = <Image className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
                        pillStyle = "bg-purple-500/10 border-purple-500/20 text-purple-300 hover:border-purple-500/30";
                      } else if (cType === "code") {
                        icon = <Code className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
                        pillStyle = "bg-blue-500/10 border-blue-500/20 text-blue-300 hover:border-blue-500/30";
                      } else if (cType === "gdrive") {
                        icon = <Triangle className="w-3.5 h-3.5 text-emerald-400 shrink-0 rotate-180" />;
                        pillStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:border-emerald-500/30";
                      } else if (cType === "url") {
                        icon = <Link className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
                        pillStyle = "bg-zinc-500/10 border-zinc-500/20 text-zinc-300 hover:border-zinc-500/30";
                      }

                      const showPreview = cType === "media" && file.base64;

                      return (
                        <div
                          key={`attachment-${idx}`}
                          className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-full text-xs transition-all duration-200 ${pillStyle}`}
                        >
                          {showPreview ? (
                            <img src={file.base64} alt={file.name} className="w-4 h-4 object-cover rounded-full shrink-0 border border-purple-500/30" />
                          ) : (
                            icon
                          )}
                          <span className="max-w-[120px] truncate" title={file.name}>{file.name}</span>
                          {file.size > 0 && (
                            <span className="text-[9px] text-zinc-500 font-mono">({formatSize(file.size)})</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="p-0.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                            title="Remove attachment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer Control Action Bar of the Input Area */}
                <div className="flex flex-wrap items-center justify-between pt-3 px-1 border-t border-white/5 gap-3">
                  
                  {/* Consolidated Popover Attachment Menu Trigger */}
                  <div className="flex items-center gap-2 relative attachment-menu-container">
                    {/* Hidden inputs triggered by our modular popup options */}
                    <input
                      type="file"
                      ref={mediaInputRef}
                      onChange={(e) => handleAttachmentFileChange(e, 'media')}
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={codeInputRef}
                      onChange={(e) => handleAttachmentFileChange(e, 'code')}
                      accept=".c,.py,.txt,.json,.js,.ts,.tsx,.html,.css,.java,.cpp,.md,.pdf"
                      multiple
                      className="hidden"
                    />

                    {/* Paperclip Button Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className={`p-2 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer flex items-center justify-center border ${
                        showAttachmentMenu ? "bg-red-500/20 text-red-300 border-red-500/35" : "bg-white/5 border-white/5 hover:bg-white/10"
                      }`}
                      title="Attach context files or references"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Claude/Gemini-Style Minimalist Popup Menu */}
                    <AnimatePresence>
                      {showAttachmentMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-12 left-0 mb-2 flex items-center gap-1.5 bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-1.5 z-30"
                        >
                          {/* Image button */}
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                mediaInputRef.current?.click();
                                setShowAttachmentMenu(false);
                              }}
                              className="p-2.5 rounded-xl text-zinc-400 hover:text-purple-400 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                              title="Add Photos/Videos"
                            >
                              <Image className="w-4 h-4 shrink-0" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-40 shadow-xl font-mono leading-none">
                              Add Photos/Videos
                            </div>
                          </div>

                          {/* Code button */}
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                codeInputRef.current?.click();
                                setShowAttachmentMenu(false);
                              }}
                              className="p-2.5 rounded-xl text-zinc-400 hover:text-blue-400 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                              title="Attach Code/Files"
                            >
                              <Code className="w-4 h-4 shrink-0" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-40 shadow-xl font-mono leading-none">
                              Attach Code/Files
                            </div>
                          </div>

                          {/* GDrive button */}
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                setAttachmentInputMode("gdrive");
                                setAttachmentInputValue("");
                                setShowAttachmentMenu(false);
                              }}
                              className="p-2.5 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center rotate-180"
                              title="Link Google Drive"
                            >
                              <Triangle className="w-4 h-4 shrink-0" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-40 shadow-xl font-mono leading-none">
                              Link Google Drive
                            </div>
                          </div>

                          {/* Link button */}
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                setAttachmentInputMode("url");
                                setAttachmentInputValue("");
                                setShowAttachmentMenu(false);
                              }}
                              className="p-2.5 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                              title="Add URL Link"
                            >
                              <Link className="w-4 h-4 shrink-0" />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-40 shadow-xl font-mono leading-none">
                              Add URL Link (Project specs, documentation, task references)
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Inline Link/GDrive Paste Input Box */}
                    <AnimatePresence>
                      {attachmentInputMode && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 280 }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 overflow-hidden"
                        >
                          {attachmentInputMode === "gdrive" ? (
                            <Triangle className="w-3.5 h-3.5 text-emerald-400 shrink-0 rotate-180" />
                          ) : (
                            <Link className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          )}
                          <input
                            type="text"
                            placeholder={
                              attachmentInputMode === "gdrive"
                                ? "Paste Google Drive/Notebook link & Enter"
                                : "Paste project specs, documentation, or task reference link & press Enter"
                            }
                            value={attachmentInputValue}
                            onChange={(e) => setAttachmentInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const val = attachmentInputValue.trim();
                                if (val) {
                                  let formattedVal = val;
                                  if (!/^https?:\/\//i.test(val)) {
                                    formattedVal = "https://" + val;
                                  }
                                  
                                  const newAttachment: UploadedFile = {
                                    name: val,
                                    size: 0,
                                    type: attachmentInputMode === "gdrive" ? "application/vnd.google-apps.drive-link" : "text/html",
                                    mimeType: attachmentInputMode === "gdrive" ? "application/vnd.google-apps.drive-link" : "text/html",
                                    base64: "",
                                    contextType: attachmentInputMode,
                                    url: formattedVal
                                  };

                                  setFiles(prev => {
                                    if (prev.some(f => f.url === formattedVal || f.name === val)) return prev;
                                    return [...prev, newAttachment];
                                  });
                                  setAttachmentInputValue("");
                                  setAttachmentInputMode(null);
                                }
                              }
                            }}
                            className="bg-transparent border-none text-[11px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-0 w-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setAttachmentInputMode(null);
                              setAttachmentInputValue("");
                            }}
                            className="p-0.5 rounded text-zinc-500 hover:text-zinc-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit instruction helper & subtle Send button */}
                  <div className="flex items-center gap-3">
                    <span className="hidden md:inline text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
                      Enter to generate plan • Shift+Enter for newline
                    </span>
                    
                    {/* Circular Sleek Send Button */}
                    <button
                      type="submit"
                      disabled={loading || !task.trim()}
                      className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden ${
                        loading
                          ? "bg-white/5 text-zinc-600 cursor-not-allowed border border-white/10"
                          : task.trim()
                          ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-105 cursor-pointer"
                          : "bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5"
                      }`}
                      title="Generate action plan"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Row with Select and Slider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Input 2: Time Left Dropdown */}
              <div className="space-y-3">
                <label htmlFor="time-left-select" className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  How much time do you have left?
                </label>
                <div className="relative">
                  <select
                    id="time-left-select"
                    value={timeLeft}
                    onChange={(e) => setTimeLeft(e.target.value)}
                    className="w-full bg-zinc-950/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/30 cursor-pointer appearance-none transition-all"
                  >
                    <option value="Under 24 hours (Extreme Triage)">Under 24 hours (Extreme Triage)</option>
                    <option value="2 Days (Urgent Execution)">2 Days (Urgent Execution)</option>
                    <option value="3-5 Days (Strategic Push)">3-5 Days (Strategic Push)</option>
                    <option value="1 Week (Standard Planning)">1 Week (Standard Planning)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>

              {/* Input 3: Panic Level Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="panic-level-slider" className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    What is your current panic level?
                  </label>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-mono font-black border uppercase tracking-wider transition-all duration-300 ${panicData.bg} ${panicData.color}`}>
                    Level {panicLevel}/10: {panicData.text}
                  </span>
                </div>

                <div className="pt-2">
                  <input
                    id="panic-level-slider"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={panicLevel}
                    onChange={(e) => setPanicLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 focus:outline-none focus:ring-0"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-2 px-1">
                    <span>1 (Mild Chill)</span>
                    <span>5 (Sweating)</span>
                    <span>10 (Total Apocalypse)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Panic Subtext Descriptor */}
            <motion.p
              key={panicLevel}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-zinc-400 italic bg-white/[0.01] border border-white/5 p-3.5 rounded-xl leading-relaxed"
            >
              {panicData.desc}
            </motion.p>

          </form>
        </section>

        {/* LOADING ANIMATED PANEL */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white/[0.02] backdrop-blur-[12px] border border-white/10 p-8 rounded-2xl text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-red-500/5 to-emerald-500/5 animate-[pulse_6s_infinite]" />
              
              {/* Spinner */}
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-r-purple-500 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg text-zinc-200">
                  Formulating Your Survival Plan
                </h3>
                
                {/* Dynamic cycling loading steps */}
                <motion.p
                  key={loadingStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm font-mono text-purple-400"
                >
                  {loadingSteps[loadingStep]}
                </motion.p>
              </div>

              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Hang tight. Sticking to raw micro-bullets can take an extra moment as our model strips unnecessary jargon and synthesizes targeted exam survival strategies.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ERROR MESSAGE DISPLAY BANNER */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-5 rounded-xl bg-red-950/40 backdrop-blur-[12px] border border-red-500/30 text-red-200 flex items-start gap-4 shadow-2xl"
            >
              <div className="p-2 rounded bg-red-500/20 text-red-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-red-300">Triage System Alert</h4>
                <p className="text-xs leading-relaxed font-semibold">
                  {errorMessage}
                </p>
                <p className="text-[10px] text-red-400 font-mono mt-1.5">
                  Recommendation: Please review the active action cards below to begin your sprint. Or try clicking "Generate" again once load alleviates.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OUTPUT ACTION PLAN RESULT MODULE */}
        <AnimatePresence>
          {plan && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Save State Banner */}
              <div className="flex flex-wrap gap-2 items-center justify-between bg-white/[0.02] backdrop-blur-[12px] border border-white/10 rounded-xl px-4 py-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-mono">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>ACTIVE ROADMAP SECURED OFFLINE</span>
                  {isSimulated && (
                    <span className="ml-2 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-red-600/90 text-white border border-red-400 animate-pulse">
                      ⚠️ NOT AI-GENERATED — Offline Template (Gemini Unreachable)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isSimulated && (
                    <button
                      onClick={handleExportIcs}
                      disabled={exportingIcs}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200 transition-all font-mono font-medium cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{exportingIcs ? "EXPORTING..." : "EXPORT TO CALENDAR"}</span>
                    </button>
                  )}
                  <button
                    onClick={clearPlan}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200 transition-all font-mono font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>RESET ROADMAP</span>
                  </button>
                </div>
              </div>

              {/* Real Plan Content */}
              <PlanViewer
                plan={plan}
                panicLevel={panicLevel}
                timeLeft={timeLeft}
                completedStepIds={completedStepIds}
                onToggleStep={handleToggleStep}
                onReplan={handleReplan}
                replanning={replanning}
                isSimulated={isSimulated}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Elegant Humble Footer */}
      <footer className="border-t border-zinc-900/60 bg-zinc-950/40 py-8 text-center text-xs text-zinc-500 space-y-2">
        <p>© 2026 Crunch Co-Pilot. All systems nominal.</p>
        <p className="text-[10px] font-mono text-zinc-600 max-w-md mx-auto leading-normal">
          Designed with a premium dark theme. Built to rescue academic passes and professional emergencies.
        </p>
      </footer>
      </div>
    </div>
  );
}
