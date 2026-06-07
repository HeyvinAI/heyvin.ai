import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, Sparkles, RefreshCw, Image, Download, Share2, CornerDownRight, CheckCircle } from "lucide-react";
import { WeeklyReport, UserProfile, CheckIn } from "../types";
import { db } from "../lib/supabase";

interface WeeklyReportViewProps {
  user: UserProfile;
  stealthActive: boolean;
}

export default function WeeklyReportView({ user, stealthActive }: WeeklyReportViewProps) {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [history, setHistory] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load from db on mount
  useEffect(() => {
    loadReports();
  }, [user.uid]);

  const loadReports = () => {
    const list = db.get<WeeklyReport>(user.uid, "weekly_reports");
    setHistory(list);
    
    // Look for this week's report (e.g. current calendar week start)
    const currentWeekStart = "2026-06-01"; // Fixed week starting range for demo consistency
    const currentReport = list.find(r => r.week_start === currentWeekStart);
    if (currentReport) {
      setReport(currentReport);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const currentScoreObj = db.calculateSovereigntyScore(user.uid);
      const checkins = db.get<CheckIn>(user.uid, "check_ins");
      const totalReclaimed = checkins.reduce((acc: number, current: any) => acc + Number(current.hours_reclaimed || 0), 0);
      
      const payload = {
        userData: {
          username: user.username,
          location: user.location,
          based_in: user.based_in,
          home_situation: user.home_situation,
          primary_goal: user.primary_goal,
          hoursReclaimed: totalReclaimed,
          averageStress: checkins.length > 0 ? Math.floor(checkins.reduce((acc: number, current: any) => acc + Number(current.stress_level || 0), 0) / checkins.length) : 40,
          score: currentScoreObj.score,
          completionRate: "82%"
        }
      };

      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      // Save generating report to mock database
      const weekStartStr = "2026-06-01";
      const newReport: WeeklyReport = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: user.uid,
        week_start: weekStartStr,
        report_text: data.report || "This Week: High consistency, 6.5 hours reclaimed...",
        score: currentScoreObj.score,
        hours_reclaimed: totalReclaimed,
        created_at: new Date().toISOString()
      };

      db.upsert(user.uid, "weekly_reports", newReport);
      setReport(newReport);
      loadReports();
      
      if (data.note === "simulated-fallback") {
        setErrorNotice("No API key set - loaded simulated local intelligence successfully!");
      }
    } catch (e) {
      console.error(e);
      setErrorNotice("Connection timed out - fallback simulation activated.");
      // Force seeding of custom fallback
      const weekStartStr = "2026-06-01";
      const precalc = db.calculateSovereigntyScore(user.uid);
      
      let countryText = `This Week: Your Lagos diary shows 6.5 hours reclaimed from noisy family slots this week. By checking in during early hours, you dodged peak traffic chaos and home grocery runs.\n\nWhat's Working: Creating a solid boundary during Wednesday mornings was a master game-changer. Logging a Sovereignty Score of ${precalc.score} reflects how fiercely you guarded this time.\n\nNext Week's Forecast: Weekday evenings are predicted to peak at 85% friction due to electrical outages. Your best calm study window sits firmly between 7:00 AM and 10:00 AM.\n\nYour Sovereignty Move: Silence your phone and lock your study space on Monday morning. One hour of focused effort early is worth three hours struggling through noisy generator noise in the evening.`;
      
      if (user.location === 'Delhi') {
        countryText = `This Week: Your Delhi logs show 8.2 hours reclaimed, heavily powered by using your library slots and quiet rooftop breaks.\n\nWhat's Working: Shifting your toughest math and tech practice to the late night slots kept you 3 steps ahead of the domestic noise.\n\nNext Week's Forecast: Weekend afternoons will spike in friction due to incoming relatives. Your predictive calm sweet spot is Tuesday and Wednesday between 10:00 AM and 1:30 PM.\n\nYour Sovereignty Move: Say a polite 'no' to social invitations on Saturday afternoon. Invest that afternoon pocket in your competitive computer prep.`;
      } else if (user.location === 'Mexico') {
        countryText = `This Week: Mexico City has been busy, but you managed to secure 7.4 hours of pure peace this week. You adapted quickly during high-stress moments.\n\nWhat's Working: Logging your check-ins consistently let you recognize stress before it got overwhelming.\n\nNext Week's Forecast: Weekday evenings from 6:00 PM to 9:00 PM will continue to host your highest friction levels. Focus on studying during the afternoon shift.\n\nYour Sovereignty Move: Treat your afternoon slots like non-negotiable appointments. Put on your headphones, set a 2-hour timer, and show up for yourself.`;
      }

      const backup: WeeklyReport = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: user.uid,
        week_start: weekStartStr,
        report_text: countryText,
        score: precalc.score,
        hours_reclaimed: 6.5,
        created_at: new Date().toISOString()
      };
      
      db.upsert(user.uid, "weekly_reports", backup);
      setReport(backup);
      loadReports();
    } finally {
      setLoading(false);
    }
  };

  // Parsing report text into the 4 requested sections
  // Each starts with: "This Week: ", "What's Working: ", "Next Week's Forecast: ", "Your Sovereignty Move: "
  const parseReport = (text: string) => {
    const sectionsObj = {
      thisWeek: "",
      whatsWorking: "",
      forecast: "",
      move: ""
    };

    if (!text) return sectionsObj;

    const lower = text.toLowerCase();
    
    // Split by newline and attempt sorting
    const blocks = text.split(/\n+/);
    blocks.forEach(block => {
      if (block.startsWith("This Week:") || block.startsWith("This Week") || block.includes("This Week:")) {
        sectionsObj.thisWeek = block.replace(/This Week:\s*/i, "");
      } else if (block.startsWith("What's Working:") || block.startsWith("What's Working") || block.includes("What's Working:")) {
        sectionsObj.whatsWorking = block.replace(/What's Working:\s*/i, "");
      } else if (block.startsWith("Next Week's Forecast:") || block.startsWith("Next Week's Forecast") || block.includes("Forecast:")) {
        sectionsObj.forecast = block.replace(/Next Week's Forecast:\s*/i, "").replace(/Forecast:\s*/i, "");
      } else if (block.startsWith("Your Sovereignty Move:") || block.startsWith("Your Sovereignty Move") || block.includes("Sovereignty Move:")) {
        sectionsObj.move = block.replace(/Your Sovereignty Move:\s*/i, "").replace(/Sovereignty Move:\s*/i, "");
      }
    });

    // If parsing failed to find blocks (e.g. model output didn't use perfect separators), slice it up
    if (!sectionsObj.thisWeek && blocks.length >= 4) {
      sectionsObj.thisWeek = blocks[0];
      sectionsObj.whatsWorking = blocks[1];
      sectionsObj.forecast = blocks[2];
      sectionsObj.move = blocks[3];
    } else if (!sectionsObj.thisWeek) {
      // Just split by paragraph or sentences
      sectionsObj.thisWeek = text.slice(0, Math.floor(text.length / 4));
      sectionsObj.whatsWorking = text.slice(Math.floor(text.length / 4), Math.floor(text.length / 2));
      sectionsObj.forecast = text.slice(Math.floor(text.length / 2), Math.floor(3 * text.length / 4));
      sectionsObj.move = text.slice(Math.floor(3 * text.length / 4));
    }

    return sectionsObj;
  };

  const currentParsed = parseReport(report?.report_text || "");

  const handleShareClipboard = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(`I reclaimed ${report?.hours_reclaimed || 6.5} hours of focus time this week! Sovereignty Score: ${report?.score || 78} pts. Compiled on Heyvin AI.`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSelectHistoryReport = (hist: WeeklyReport) => {
    setReport(hist);
  };

  return (
    <div id="weekly_report_container" className="space-y-6 max-w-4xl mx-auto">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${stealthActive ? "font-sans text-gray-900" : "font-serif text-amber-900"}`}>
            {stealthActive ? "Weekly Study Syllabus" : "Weekly Sovereignty Report"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {stealthActive ? "Academic review metrics and productivity performance digests." : "Personal data-driven coaching digests, looking back at hours protected and predicting friction spikes."}
          </p>
        </div>
        
        {!report && (
          <button
            onClick={generateReport}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
              stealthActive 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-amber-900 hover:bg-amber-950 text-orange-50"
            }`}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Generating report..." : "Compile Weekly Digest"}
          </button>
        )}
      </div>

      {errorNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-sans flex items-center gap-2">
          <span>{errorNotice}</span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${stealthActive ? "border-blue-600" : "border-amber-900"}`} />
          <p className="text-xs text-gray-500 font-medium animate-pulse">Running data aggregation via Heyvin AI engine...</p>
        </div>
      )}

      {/* Report Showcase */}
      {report && !loading && (
        <div className="space-y-6">
          {/* Dashboard Header Bar */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            stealthActive ? "bg-white border-gray-200" : "bg-[#FEFAF6] border-orange-100/50"
          }`}>
            <div>
              <span className={`text-lg font-bold font-serif ${stealthActive ? "font-sans text-gray-800" : "text-amber-950"}`}>
                Week Beginning: Jun 1, 2026
              </span>
              <p className="text-xs text-gray-400 mt-0.5">Calculated from 7 environment check-ins</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                stealthActive ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-orange-50 text-amber-800 border border-orange-100"
              }`}>
                Score: {report.score} pts
              </div>
              <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-bold">
                {report.hours_reclaimed} hrs reclaimed
              </div>
            </div>
          </div>

          {/* 4 Prose blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* This Week */}
            <div className={`p-5 rounded-2xl border bg-white ${
              stealthActive ? "border-l-4 border-l-blue-600 border-gray-100 shadow-sm" : "border-l-4 border-l-orange-400/80 border-[#fedbd0]/50 shadow-sm"
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">This Week</h4>
              <p className="text-xs text-gray-700 leading-relaxed font-sans">{currentParsed.thisWeek}</p>
            </div>

            {/* What's Working */}
            <div className={`p-5 rounded-2xl border bg-white ${
              stealthActive ? "border-l-4 border-l-green-600 border-gray-100 shadow-sm" : "border-l-4 border-l-teal-400/80 border-[#fedbd0]/50 shadow-sm"
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">What's Working</h4>
              <p className="text-xs text-gray-700 leading-relaxed font-sans">{currentParsed.whatsWorking}</p>
            </div>

            {/* Next Week's Forecast */}
            <div className={`p-5 rounded-2xl border bg-white ${
              stealthActive ? "border-l-4 border-l-purple-600 border-gray-100 shadow-sm" : "border-l-4 border-l-amber-500/80 border-[#fedbd0]/50 shadow-sm"
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">What's Next (Forecast)</h4>
              <p className="text-xs text-gray-700 leading-relaxed font-sans">{currentParsed.forecast}</p>
            </div>

            {/* Your Sovereignty Move */}
            <div className={`p-5 rounded-2xl border bg-white ${
              stealthActive ? "border-l-4 border-l-rose-500 border-gray-100 shadow-sm" : "border-l-4 border-l-[#E28E75] border-[#fedbd0]/50 shadow-sm"
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Your Sovereignty Move</h4>
              <p className="text-xs text-gray-700 leading-relaxed font-sans font-medium">{currentParsed.move}</p>
            </div>
          </div>

          {/* Shareable Insight screenshot widget */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowScreenshot(!showScreenshot)}
              className={`w-fit px-4 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                stealthActive ? "border-gray-200 bg-white hover:bg-gray-50 text-gray-700" : "border-orange-100 bg-[#FEFAF6]/50 hover:bg-orange-50 text-amber-900"
              }`}
            >
              <Image size={14} className="text-gray-500" />
              {showScreenshot ? "Hide Shareable Card" : "View Shareable Poster Mockup"}
            </button>

            {showScreenshot && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row gap-6">
                {/* Visual poster to screenshot */}
                <div id="screenshot-card" className="w-full max-w-sm rounded-2xl p-6 bg-gradient-to-br from-[#E28E75] to-[#B06450] text-[#FFF4F0] min-h-[300px] flex flex-col justify-between shadow-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2.5 py-1 rounded-full">
                      Heyvin AI · SUCCESS AUDIT
                    </span>
                    <h5 className="text-[32px] font-bold font-serif leading-tight mt-6 tracking-tight">
                      Reclaimed {report.hours_reclaimed} Hrs
                    </h5>
                    <p className="text-xs opacity-90 mt-2 leading-relaxed">
                      "Because the woman who protects her study hours is not being selfish. She is strategic."
                    </p>
                  </div>
                  <div className="flex items-end justify-between border-t border-white/10 pt-4 mt-6">
                    <div>
                      <span className="text-[10px] uppercase opacity-75 font-mono">SOVEREIGNTY SCORE</span>
                      <p className="text-lg font-bold font-serif">{report.score} pts · Week 8</p>
                    </div>
                    <span className="text-[11px] font-bold tracking-widest opacity-80 uppercase leading-none pb-1">
                      HEYVIN
                    </span>
                  </div>
                </div>

                {/* Info actions */}
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div>
                    <h6 className="text-xs font-bold uppercase text-gray-500 mb-1">Share Achievement</h6>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Heyvin keeps your private journaling, check-ins, and rehearsals 100% encrypted on your local database. Only beautiful statistics badges like this poster showing hours reclaimed can be safely screenshot and shared to motivate friends.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShareClipboard}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white border cursor-pointer hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      {copiedLink ? <CheckCircle size={14} className="text-green-600" /> : <Share2 size={14} className="text-gray-500" />}
                      {copiedLink ? "Copied Poster Stats!" : "Copy stats to clipboard"}
                    </button>
                    <p className="text-[10px] text-gray-400">Screenshot left card to post on story!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical reports list */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${stealthActive ? "text-gray-500" : "text-amber-800"}`}>
            Past Weekly Reports History
          </h4>
          <div className="divide-y divide-gray-50 max-h-40 overflow-y-auto">
            {history.map((hist, index) => (
              <div
                key={hist.id || index}
                onClick={() => handleSelectHistoryReport(hist)}
                className={`py-2 px-3 text-xs flex justify-between items-center rounded-lg cursor-pointer transition-all ${
                  report?.id === hist.id ? "bg-orange-50/50 font-medium text-amber-900" : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={12} className="text-gray-400" />
                  <span>Week Start: {hist.week_start}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono">{hist.score} pts</span>
                  <span className="text-gray-400">({hist.hours_reclaimed} hrs reclaimed)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
