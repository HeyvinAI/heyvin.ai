import React, { useState, useEffect } from "react";
import { db } from "../lib/supabase";
import { Sparkles, Calendar, Loader2 } from "lucide-react";

interface BriefingRecord {
  id: string;
  user_id: string;
  briefing_date: string; // YYYY-MM-DD
  content: string;
  created_at: string;
}

interface MorningBriefingCardProps {
  userId: string;
  stealthActive: boolean;
  pendingTasksCount: number;
  lastSovereigntyScore: number;
  predictedSafeWindow: string;
  lastJournalMood?: string;
}

export function MorningBriefingCard({
  userId,
  stealthActive,
  pendingTasksCount,
  lastSovereigntyScore,
  predictedSafeWindow,
  lastJournalMood
}: MorningBriefingCardProps) {
  const [briefingText, setBriefingText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadOrCreateBriefing() {
      setLoading(true);
      const todayStr = new Date().toISOString().split("T")[0];
      
      // Try to read from db cache
      const cached = db.get<BriefingRecord>(userId, "daily_briefings");
      const todayBrief = cached.find((b) => b.briefing_date === todayStr);

      if (todayBrief) {
        setBriefingText(todayBrief.content);
        setLoading(false);
        return;
      }

      // If nothing cached, let's trigger call to Gemini route /api/morning-briefing
      try {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayOfWeek = dayNames[new Date().getDay()];

        const response = await fetch("/api/morning-briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userData: {
              dayOfWeek,
              pendingTaskCount: pendingTasksCount,
              lastSovereigntyScore: lastSovereigntyScore,
              predictedSafeWindow: predictedSafeWindow,
              lastJournalMood: lastJournalMood || "Okay"
            }
          })
        });

        const resData = await response.json();
        const text = resData.briefing || "Welcome of the day. Reclaim focus early before household requests emerge.";

        // save into cache database
        const newRecord: BriefingRecord = {
          id: Math.random().toString(36).substring(2, 11),
          user_id: userId,
          briefing_date: todayStr,
          content: text,
          created_at: new Date().toISOString()
        };

        db.upsert(userId, "daily_briefings", newRecord);
        setBriefingText(text);
      } catch (error) {
        console.error("Failed to generate morning brief, using fallback:", error);
        setBriefingText(
          `Happy ${new Date().toLocaleDateString("en", { weekday: "long" })}! mornings are typically your sweet spot, utilize this quiet window before the household wakes. You have ${pendingTasksCount} key tasks pending and a predicted safe pocket around ${predictedSafeWindow}. Make sure to safeguard those hours fiercely and claim your space today.`
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrCreateBriefing();
  }, [userId, pendingTasksCount, lastSovereigntyScore, predictedSafeWindow, lastJournalMood]);

  const readableDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="bg-white border-l-4 border-l-[#7C2D3E] border-y border-r border-[#EDE8E0] rounded-r-xl rounded-l-md p-6 shadow-sm space-y-3 relative overflow-hidden transition-all">
      {/* Absolute faint background brand indicator */}
      <div className="absolute right-3 top-3 opacity-10 font-serif text-[44px] uppercase select-none leading-none tracking-tighter">
        {stealthActive ? "Plan" : "Brief"}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className={stealthActive ? "text-blue-600" : "text-[#7C2D3E] animate-pulse"} />
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7A6860] font-sans">
            {stealthActive ? "DAILY PLANNING MEMO" : "TODAY'S MORNING BRIEFING"}
          </span>
        </div>
        <span className="text-[11px] font-mono text-gray-400 font-semibold uppercase">
          {readableDate}
        </span>
      </div>

      {loading ? (
        <div className="py-4 flex items-center gap-3 text-xs text-gray-500 font-sans">
          <Loader2 size={16} className="animate-spin text-[#7C2D3E]" />
          <span>Synthesizing today's sovereignty forecast logs...</span>
        </div>
      ) : (
        <p className="font-serif text-[15px] leading-relaxed text-[#1A1414] italic">
          "{briefingText}"
        </p>
      )}

      <div className="text-[10px] text-gray-400 font-sans">
        💡 {stealthActive ? "Analysis compiled from curriculum task syllabus." : "Weekly routine telemetry synchronized securely."}
      </div>
    </div>
  );
}
