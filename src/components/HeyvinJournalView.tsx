import React, { useState, useMemo, useEffect } from "react";
import { db } from "../lib/supabase";
import { motion } from "motion/react";
import { Search, PenTool, BookOpen, AlertCircle, FileText, Calendar, Sparkles, Loader2 } from "lucide-react";

interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood: "Overwhelmed" | "Heavy" | "Okay" | "Calm" | "Strong";
  ai_reflection: string;
  created_at: string;
  entry_date: string;
}

interface HeyvinJournalViewProps {
  userId: string;
  stealthActive: boolean;
}

export function HeyvinJournalView({ userId, stealthActive }: HeyvinJournalViewProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load entries
  useEffect(() => {
    const list = db.get<JournalEntry>(userId, "journal_entries");
    // Sort newest first
    const sorted = [...list].sort((a,b) => b.created_at.localeCompare(a.created_at));
    setEntries(sorted);
  }, [userId]);

  const wordCount = useMemo(() => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  }, [content]);

  // Handle saving new entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim() === "Dear Heyvin," || content.trim() === "Dear StudySync,") {
      setErrorMsg("Please offload some thoughts first before saving.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content })
      });

      const resData = await response.json();
      
      const newEntry: JournalEntry = {
        id: Math.random().toString(36).substring(2, 11),
        user_id: userId,
        content: content,
        mood: resData.mood || "Okay",
        ai_reflection: resData.ai_reflection || "Heyvin is holding secure space for your thoughts.",
        created_at: new Date().toISOString(),
        entry_date: new Date().toISOString().split("T")[0]
      };

      // save
      db.upsert(userId, "journal_entries", newEntry);
      
      // refresh lists
      const list = db.get<JournalEntry>(userId, "journal_entries");
      const sorted = [...list].sort((a,b) => b.created_at.localeCompare(a.created_at));
      setEntries(sorted);
      
      // select the saved entry right away
      setActiveEntry(newEntry);
      // clear input editor
      setContent("");
    } catch (error) {
      console.error("Journal analysis error:", error);
      setErrorMsg("Failed to analyze memory securely, please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter list of entries
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const textMatches = e.content.toLowerCase().includes(searchQuery.toLowerCase());
      const moodMatches = e.mood.toLowerCase().includes(searchQuery.toLowerCase());
      const dateMatches = e.entry_date.includes(searchQuery);
      return textMatches || moodMatches || dateMatches;
    });
  }, [entries, searchQuery]);

  // Pre-fill greeting on mount
  useEffect(() => {
    if (!content) {
      setContent(stealthActive ? "Dear StudySync,\n\n" : "Dear Heyvin,\n\n");
    }
  }, [stealthActive]);

  // Mood Chip color helper
  const getMoodColors = (mood: JournalEntry["mood"]) => {
    switch (mood) {
      case "Overwhelmed":
        return stealthActive 
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-red-50 text-red-700 border-[#7C2D3E]/20";
      case "Heavy":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Okay":
        return "bg-slate-50 text-slate-600 border-slate-200";
      case "Calm":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Strong":
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  return (
    <div id="heyvin_journal_view" className="space-y-6">
      {/* Editorial Header */}
      <div className="border-b border-[#EDE8E0] pb-4">
        <h1 className="text-3xl font-bold font-serif tracking-tight text-[#1A1414]">
          {stealthActive ? "Daily Practice Reflector" : "Heyvin Journal"}
        </h1>
        <p className="text-xs font-sans text-[#7A6860] mt-1 uppercase tracking-wider font-semibold">
          {stealthActive ? "Offload clinical training fatigue & track wellness indicators" : "Encrypted offloading and active mental validation companions"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Create Entry Space */}
        <div className="lg:col-span-7 bg-white border border-[#EDE8E0] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <PenTool size={16} className={stealthActive ? "text-blue-600" : "text-[#7C2D3E]"} />
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7A6860]">
                {stealthActive ? "NEW DAILY LOG" : "NEW JOURNAL SCRATCHPAD"}
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-500">
              {new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
            </span>
          </div>

          <form onSubmit={handleSaveEntry} className="space-y-3">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 text-[11px] font-sans text-red-700 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Minimal paper-feel textarea */}
            <div className="relative border border-[#EDE8E0] rounded-lg overflow-hidden bg-[#FAF7F2]/30 p-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Offload whatever is crowding your focus..."
                rows={9}
                className="w-full bg-transparent border-none outline-none focus:ring-0 resize-none font-serif text-[15px] leading-relaxed text-[#1A1414] placeholder-gray-400"
              />
              
              {/* Word Count Indicator bottom-right */}
              <div className="absolute bottom-3 right-4 text-[10px] uppercase tracking-widest text-[#7A6860] font-sans font-bold select-none">
                {wordCount} {wordCount === 1 ? "Word" : "Words"}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={`w-full py-2.5 rounded-lg text-xs tracking-wider uppercase font-extrabold font-sans flex items-center justify-center gap-2 cursor-pointer transition-all ${
                stealthActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-[#7C2D3E] hover:bg-[#60202e] text-white"
              } disabled:opacity-50`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Analyzing & Encrypting...</span>
                </>
              ) : (
                <span>Save Entry & Process Mood</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Archives & Selected Read Views */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Entry Detail modal-esque display if selected */}
          {activeEntry ? (
            <div className="bg-white border border-[#EDE8E0] rounded-xl p-5 shadow-sm space-y-4 relative">
              <button 
                onClick={() => setActiveEntry(null)}
                className="absolute top-4 right-4 text-[10px] tracking-wider uppercase font-bold text-gray-400 hover:text-black cursor-pointer bg-gray-50 px-2 py-1 rounded"
              >
                Close View
              </button>

              <div className="border-b border-gray-100 pb-3 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                  REFLECTING ENTRY
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${getMoodColors(activeEntry.mood)}`}>
                  {activeEntry.mood}
                </span>
              </div>

              {/* Day */}
              <div className="flex items-center gap-2 text-xs text-[#7A6860] font-semibold font-sans">
                <Calendar size={13} />
                <span>{new Date(activeEntry.created_at).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
              </div>

              {/* Text content with serif minimal layout */}
              <p className="font-serif text-sm leading-relaxed text-[#1A1414] whitespace-pre-wrap bg-[#FAF7F2]/20 p-3 rounded-lg border border-gray-100/50">
                {activeEntry.content}
              </p>

              {/* Heyvin heard you container - Burgundy Accent border left */}
              <div className={`p-4 rounded-xl border-l-4 ${
                stealthActive ? "border-l-blue-600 bg-blue-50/10" : "border-l-[#7C2D3E] bg-orange-50/25"
              } border-y border-r border-[#EDE8E0]`}>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold text-[#7A6860] mb-1.5">
                  <Sparkles size={12} className={stealthActive ? "text-blue-600" : "text-[#7C2D3E]"} />
                  <span>{stealthActive ? "StudySync Feedback" : "Heyvin Heard You"}</span>
                </div>
                <p className="font-serif italic text-xs leading-relaxed text-amber-950/90 text-[#1A1414]">
                  "{activeEntry.ai_reflection}"
                </p>
              </div>
            </div>
          ) : (
            /* Standard Archive List card */
            <div className="bg-white border border-[#EDE8E0] rounded-xl p-5 shadow-sm space-y-4">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7A6860] block">
                {stealthActive ? "ARCHIVED SYLLABUS LOGS" : "PAST ENTRIES & TIMELINES"}
              </span>

              {/* Search Box */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entries by keyword or mood..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg outline-none font-sans"
                />
              </div>

              {/* Scrollable list */}
              <div className="space-y-2 max-h-[295px] overflow-y-auto pr-1">
                {filteredEntries.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 font-sans space-y-1">
                    <BookOpen size={24} className="mx-auto text-gray-300" />
                    <p>No journal entries found</p>
                  </div>
                ) : (
                  filteredEntries.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setActiveEntry(e)}
                      className="p-3 rounded-lg border border-[#EDE8E0] bg-[#FAF7F2]/20 hover:bg-[#FAF7F2]/50 transition-all cursor-pointer flex justify-between items-start gap-4 active:scale-[0.99]"
                    >
                      <div className="space-y-1 flex-1">
                        <span className="text-[10px] font-mono text-gray-500 block">
                          {new Date(e.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <p className="text-xs font-serif text-[#1A1414] line-clamp-2 leading-relaxed">
                          {e.content.replace("Dear Heyvin,\n\n", "").replace("Dear StudySync,\n\n", "")}
                        </p>
                      </div>
                      
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-bold border flex-shrink-0 ${getMoodColors(e.mood)}`}>
                        {e.mood}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Security Privacy Notice */}
      <div className="p-4 border border-[#EDE8E0] rounded-xl bg-white text-center shadow-xs">
        <p className="text-[11px] font-sans text-gray-400">
          🔒 <strong>Confidentiality Assurance</strong>: Your journal is fully encrypted and stored locally. AI only reads entries to tag your mood and generate support streams — never shares or retains metadata externally.
        </p>
      </div>

    </div>
  );
}
