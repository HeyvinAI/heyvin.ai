import { motion } from "motion/react";
import { Crown, Sparkles, TrendingUp, Compass, Info, Award } from "lucide-react";
import { SovereigntyScore } from "../types";
import { db } from "../lib/supabase";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface SovereigntyScoreViewProps {
  userId: string;
  stealthActive: boolean;
}

export default function SovereigntyScoreView({ userId, stealthActive }: SovereigntyScoreViewProps) {
  // Fetch current aggregated score or calculate it
  const currentCalculated = db.calculateSovereigntyScore(userId);
  const scoresHistory = db.get<SovereigntyScore>(userId, "sovereignty_scores")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const score = currentCalculated.score;

  // Determine Letter Grade & Symbol (Relatable coaching vibe)
  let gradeText = "Sovereign 🛡️";
  let gradeSub = "You are fiercely guarding your time and building boundaries.";
  let gradeColor = stealthActive ? "text-blue-600" : "text-amber-800";
  let gradeBg = stealthActive ? "bg-blue-50 border-blue-100" : "bg-orange-50/60 border-orange-100/50";

  if (score >= 80) {
    gradeText = "Sovereign 🛡️";
    gradeSub = "You are fiercely guarding your energy; critical windows are bulletproof.";
  } else if (score >= 60) {
    gradeText = "Holding Ground ⚔️";
    gradeSub = "You have established stable borders despite house friction. Stand firm.";
    gradeColor = stealthActive ? "text-blue-500" : "text-amber-700 font-medium";
  } else if (score >= 40) {
    gradeText = "Gaining Footing 🌱";
    gradeSub = "Some boundaries are taking root. Keep reclaiming those quiet pockets.";
    gradeColor = stealthActive ? "text-gray-600" : "text-orange-700/80";
  } else {
    gradeText = "Rebuilding 💜";
    gradeSub = "Household chaos has breached focus blocks. Breathe and log a 20min study sprint.";
    gradeColor = "text-purple-600";
    gradeBg = "bg-purple-50/60 border-purple-100/50";
  }

  // Combine calculated score into chronological array for Recharts
  const chartData = scoresHistory.map((s, i) => ({
    name: s.week_start,
    score: s.score,
    grade: s.score >= 80 ? "Sovereign" : s.score >= 60 ? "Holding" : s.score >= 40 ? "Gaining" : "Rebuilding"
  }));

  // Add the current calculated score to the history if it isn't already included or represents the latest
  if (chartData.length === 0 || chartData[chartData.length - 1].name !== currentCalculated.week_start) {
    chartData.push({
      name: currentCalculated.week_start,
      score: currentCalculated.score,
      grade: currentCalculated.score >= 80 ? "Sovereign" : currentCalculated.score >= 60 ? "Holding" : currentCalculated.score >= 40 ? "Gaining" : "Rebuilding"
    });
  }

  // Score comparison calculation
  const previousScore = scoresHistory.length > 1 ? scoresHistory[scoresHistory.length - 2].score : 70;
  const difference = score - previousScore;
  const formatDiff = difference >= 0 ? `+${difference} from last week` : `${difference} from last week`;

  // Circular progress math (radius of 58, circumferance = 2 * PI * r = ~364.4)
  const radius = 58;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray - (score / 100) * strokeDasharray;

  return (
    <div id="sovereignty_score_container" className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${stealthActive ? "font-sans text-gray-900" : "font-serif text-amber-900"}`}>
          {stealthActive ? "Academic Grades & Metrics" : "Sovereignty Score"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {stealthActive ? "Track consistency ratings and planner completion scores." : "The signature success diagnostic. Quantify how much of yourself you protected this week."}
        </p>
      </div>

      {/* Top Section - SVG Circle Score Display */}
      <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl border transition-all ${
        stealthActive ? "bg-white border-gray-200" : "bg-[#FEFAF6] border-orange-100/60 shadow-sm"
      }`}>
        {/* Circle dial */}
        <div className="md:col-span-4 flex flex-col items-center justify-center py-4">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle track */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={`fill-none stroke-2 ${stealthActive ? "stroke-gray-100" : "stroke-orange-50"}`}
                strokeWidth="8"
              />
              {/* Highlight colored track */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={`fill-none transition-all duration-1000 ${stealthActive ? "stroke-blue-600" : "stroke-[#E28E75]"}`}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold tracking-tight ${stealthActive ? "font-sans text-gray-800" : "font-serif text-amber-950"}`}>
                {score}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                {stealthActive ? "GPA INDEX" : "PTS"}
              </span>
            </div>
          </div>
          <p className={`text-xs font-bold uppercase tracking-widest mt-3 ${stealthActive ? "text-blue-600" : "text-[#EDB870] flex items-center gap-1"}`}>
            {!stealthActive && <Crown size={12} />} {currentCalculated.week_start} Score
          </p>
        </div>

        {/* letters & metrics */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-4">
          <div className={`p-4 rounded-xl border ${gradeBg}`}>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold tracking-tight ${gradeColor}`}>
                {stealthActive ? gradeText.replace(/Sovereign|Holding Ground|Gaining Footing|Rebuilding/g, m => {
                  if (m === "Sovereign") return "Academic Distinction";
                  if (m === "Holding Ground") return "Good Standing";
                  if (m === "Gaining Footing") return "Satisfactory Progress";
                  return "Warning / Action Required";
                }) : gradeText}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 font-sans leading-relaxed">
              {gradeSub}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs px-2">
            <span className="text-gray-500 font-medium">Trajectory Index</span>
            <span className={`font-bold font-mono ${difference >= 0 ? "text-green-600" : "text-rose-500"}`}>
              {formatDiff}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section - Component breakdown */}
      <div>
        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${stealthActive ? "text-gray-500" : "text-amber-800"}`}>
          {stealthActive ? "Grade Weight Summary" : "Weekly Audit Breakdown"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Consistency */}
          <div className={`p-4 rounded-xl border ${stealthActive ? "bg-white border-gray-100" : "bg-[#FEFAF6]/50 border-orange-50"}`}>
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Consistency (25%)</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className={`text-xl font-bold font-serif ${stealthActive ? "font-sans text-gray-800" : "text-amber-950"}`}>
                {currentCalculated.consistency}/25
              </span>
              <span className="text-[10px] text-gray-400">Target: 5/7 days</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${stealthActive ? "bg-blue-600" : "bg-[#E28E75]"}`} 
                style={{ width: `${(currentCalculated.consistency / 25) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-sans leading-tight">
              {currentCalculated.consistency >= 20 ? "Perfect check-in routine." : "Secure consistent morning logs."}
            </p>
          </div>

          {/* Protection */}
          <div className={`p-4 rounded-xl border ${stealthActive ? "bg-white border-gray-100" : "bg-[#FEFAF6]/50 border-orange-50"}`}>
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Reclaimed Time (30%)</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className={`text-xl font-bold font-serif ${stealthActive ? "font-sans text-gray-800" : "text-amber-950"}`}>
                {currentCalculated.protection}/30
              </span>
              <span className="text-[10px] text-gray-400">Target: 14 hrs</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${stealthActive ? "bg-blue-600" : "bg-[#E28E75]"}`} 
                style={{ width: `${(currentCalculated.protection / 30) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 leading-tight">
              Hour-preservation is vital for study.
            </p>
          </div>

          {/* Resilience */}
          <div className={`p-4 rounded-xl border ${stealthActive ? "bg-white border-gray-100" : "bg-[#FEFAF6]/50 border-orange-50"}`}>
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Resilience Index (25%)</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className={`text-xl font-bold font-serif ${stealthActive ? "font-sans text-gray-800" : "text-amber-950"}`}>
                {currentCalculated.resilience}/25
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Boundaries</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${stealthActive ? "bg-blue-600" : "bg-[#E28E75]"}`} 
                style={{ width: `${(currentCalculated.resilience / 25) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 leading-tight">
              Protecting tasks in peaks of friction.
            </p>
          </div>

          {/* Growth */}
          <div className={`p-4 rounded-xl border ${stealthActive ? "bg-white border-gray-100" : "bg-[#FEFAF6]/50 border-orange-50"}`}>
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Trend Growth (20%)</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className={`text-xl font-bold font-serif ${stealthActive ? "font-sans text-gray-800" : "text-amber-950"}`}>
                {currentCalculated.growth}/20
              </span>
              <span className="text-[10px] text-gray-400">Vs pre-limit</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${stealthActive ? "bg-blue-600" : "bg-[#E28E75]"}`} 
                style={{ width: `${(currentCalculated.growth / 20) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 leading-tight">
              Positive margins vs trailing weeks.
            </p>
          </div>
        </div>
      </div>

      {/* Score History Graph */}
      <div className={`p-6 rounded-2xl border ${stealthActive ? "bg-white border-gray-200" : "bg-[#FEFAF6]/30 border-orange-100/50"}`}>
        <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${stealthActive ? "text-gray-500" : "text-amber-800"}`}>
          {stealthActive ? "Semester Progress Graph" : "Sovereignty Score Chronology (8 Weeks)"}
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stealthActive ? "#2563EB" : "#E28E75"} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={stealthActive ? "#2563EB" : "#E28E75"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9CA3AF" domain={[30, 100]} tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #fedbd0', 
                  backgroundColor: '#ffffff'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke={stealthActive ? "#2563EB" : "#E28E75"} 
                strokeWidth={3}
                dot={{ r: 4, stroke: stealthActive ? "#2563EB" : "#E28E75", strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-2 mt-4 text-[10px] text-gray-400">
          <Award size={14} className="text-gray-400" />
          <span>Your highest sovereignty week registered: <strong>Week 6 — 92 pts</strong> (Academic Golden Window).</span>
        </div>
      </div>
    </div>
  );
}
