import React, { useState, useEffect } from "react";
import { ActionPlan } from "../types";
import TriageStepCard from "./TriageStepCard";
import { ShieldCheck, Brain, Coffee, Award, AlertOctagon, Heart, Clock, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface PlanViewerProps {
  plan: ActionPlan;
  panicLevel: number;
  timeLeft?: string;
  completedStepIds?: Set<string>;
  onToggleStep?: (stepId: string) => void;
  onReplan?: (timeRemainingNow: string) => void;
  replanning?: boolean;
  isSimulated?: boolean;
}

export default function PlanViewer({
  plan,
  panicLevel,
  timeLeft,
  completedStepIds = new Set(),
  onToggleStep,
  onReplan,
  replanning = false,
  isSimulated = false,
}: PlanViewerProps) {
  const isEmergency = panicLevel >= 7;
  const [timeRemainingNow, setTimeRemainingNow] = useState(timeLeft || "");

  const completedCount = plan.triageCards.filter(c => completedStepIds.has(c.id)).length;
  const totalCount = plan.triageCards.length;
  const hasProgress = completedCount > 0 && completedCount < totalCount;

  // Retrieve the dynamically generated tactical tips directly from the plan object.
  // This completely eliminates static strings like Pomodoro Protocol, Brain Performance, Reset Protocol, and Ruthless Deferral.
  const guidelines = plan.stabilityGuidelines && plan.stabilityGuidelines.length > 0
    ? plan.stabilityGuidelines
    : [
        { title: "Box Breathing", text: "Inhale deeply for 4 seconds, hold for 4, exhale for 4, and hold for 4 to down-regulate your nervous system immediately." },
        { title: "Physiological Sigh", text: "Take two rapid inhales through the nose followed by one slow, sighing exhale to drop heart rate and anxiety." },
        { title: "Task Isolation", text: "Mute every device, close social channels, and focus exclusively on a single sub-task for 20 minutes." },
        { title: "Carb Avoidance", text: "Steer clear of insulin-spiking simple sugars and opt for stable proteins to preserve high cognitive stamina." }
      ];

  // Let's scroll the user smoothly to the results once loaded
  useEffect(() => {
    const el = document.getElementById("results-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [plan]);

  return (
    <div id="results-section" className="space-y-6">
      {/* Triage Alarm Banner (for extreme panic) */}
      {isEmergency && (
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex items-start gap-3.5 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
        >
          <div className="p-2 rounded bg-red-500/20 text-red-400 shrink-0 animate-pulse">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-red-400 font-display font-bold tracking-wider text-sm uppercase flex items-center gap-1.5">
              ⚠️ SYSTEM TRIAGE MODE ACTIVE
            </h3>
            <p className="text-xs text-red-200 mt-1 leading-relaxed">
              We have suppressed all non-essential filler text, extensive lectures, and long paragraphs. This is your high-contrast, raw, ultra-short tactical action roadmap. Execute these micro-steps immediate and click each checkbox to track progress.
            </p>
          </div>
        </motion.div>
      )}

      {/* Comforting Intro Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] backdrop-blur-[12px] border border-white/10 p-6 rounded-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 -ml-6 -mb-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${isEmergency ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
            {isEmergency ? <Brain className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">
              Emergency Survival Mandate
            </h3>
            <p className="text-lg md:text-xl font-display font-medium text-zinc-100 leading-normal italic">
              "{plan.comfortingIntro}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Adaptive Re-plan Bar — only meaningful for real (non-simulated) plans
          once the user has made some progress */}
      {!isSimulated && onReplan && hasProgress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-500/[0.04] border border-purple-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide font-mono">
              Progress: {completedCount}/{totalCount} steps done
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Tell us how much time is actually left now, and we'll adapt the rest of your plan.
            </p>
          </div>
          <input
            type="text"
            value={timeRemainingNow}
            onChange={(e) => setTimeRemainingNow(e.target.value)}
            placeholder="e.g. 3 hours left"
            className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40 w-full sm:w-44"
          />
          <button
            onClick={() => onReplan(timeRemainingNow)}
            disabled={replanning || !timeRemainingNow.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold font-mono uppercase tracking-wide transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${replanning ? "animate-spin" : ""}`} />
            <span>{replanning ? "Re-planning..." : "Re-plan Remaining"}</span>
          </button>
        </motion.div>
      )}

      {/* Action Plan Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/5 text-purple-400 border border-white/10">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">
              Your Tactical Triage Steps
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {plan.triageCards.length} action phases available
          </span>
        </div>

        {/* Minimalist Benefit Chips highlighting core architecture */}
        <div className="flex flex-wrap gap-2.5 pt-1.5 pb-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] sm:text-xs font-medium text-red-400 font-mono">
            <span>⚡</span>
            <span>Intelligent Prioritization</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] sm:text-xs font-medium text-purple-400 font-mono">
            <span>🎯</span>
            <span>Context-Aware Planning</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] sm:text-xs font-medium text-emerald-400 font-mono">
            <span>📅</span>
            <span>Autonomous Execution</span>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plan.triageCards.map((card, idx) => (
            <TriageStepCard
              key={card.id}
              card={card}
              index={idx}
              isCompleted={completedStepIds.has(card.id)}
              onToggleStep={onToggleStep}
            />
          ))}
        </div>
      </div>

      {/* Professional Survival Tips / Mental Stability Section */}
      <div className="bg-white/[0.02] backdrop-blur-[12px] border border-white/10 p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Coffee className="w-5 h-5 text-amber-400 shrink-0" />
          <h4 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase font-display">
            Physiological & Cognitive Stability Guidelines
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guidelines.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/[0.01] border border-white/5 rounded-lg p-3.5 flex items-start gap-3 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300"
            >
              <div className="text-[10px] font-mono font-bold text-red-400 mt-0.5 bg-red-500/10 px-1.5 py-0.5 rounded shrink-0 border border-red-500/15 uppercase tracking-wider">
                {item.title}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex flex-wrap gap-4 items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" /> Focus on progress, not perfection.
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" /> Complete critical steps first.
          </span>
        </div>
      </div>
    </div>
  );
}
