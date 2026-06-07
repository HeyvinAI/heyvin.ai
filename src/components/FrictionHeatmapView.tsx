import React, { useState, useMemo } from "react";
import { CheckIn } from "../types";
import { db } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Info, HelpCircle, Activity } from "lucide-react";

interface FrictionHeatmapViewProps {
  userId: string;
  stealthActive: boolean;
}

export function FrictionHeatmapView({ userId, stealthActive }: FrictionHeatmapViewProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    avgStress: number;
    count: number;
    dayName: string;
    x: number;
    y: number;
  } | null>(null);

  // Retrieve check-ins
  const checkIns = useMemo(() => {
    return db.get<CheckIn>(userId, "check_ins");
  }, [userId]);

  // Construct 90 days grid (13 weeks x 7 days ending on today)
  const gridData = useMemo(() => {
    const data: { dateStr: string; dayName: string; avgStress: number; count: number; date: Date }[][] = [];
    const today = new Date();
    
    // We want to end on today (Saturday of the current week, or just today)
    // To make a clean 13-week grid, we can find the Sunday of 12 weeks ago
    const startOfWeekOffset = today.getDay(); // 0 is Sunday, etc.
    const totalDays = 13 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    // Group check-ins by date
    const checkInsByDate: Record<string, CheckIn[]> = {};
    checkIns.forEach((c) => {
      // support both ISO timestamp or split date
      const dateStr = c.date.includes("T") ? c.date.split("T")[0] : c.date;
      if (!checkInsByDate[dateStr]) {
        checkInsByDate[dateStr] = [];
      }
      checkInsByDate[dateStr].push(c);
    });

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Generate 13 weeks of 7 days
    let current = new Date(startDate);
    for (let w = 0; w < 13; w++) {
      const week: typeof data[0] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split("T")[0];
        const dayLogs = checkInsByDate[dateStr] || [];
        
        let avgStress = -1;
        if (dayLogs.length > 0) {
          const total = dayLogs.reduce((acc, curr) => acc + curr.stress_level, 0);
          avgStress = total / dayLogs.length;
        }

        week.push({
          dateStr,
          dayName: daysOfWeek[current.getDay()],
          avgStress,
          count: dayLogs.length,
          date: new Date(current),
        });

        current.setDate(current.getDate() + 1);
      }
      data.push(week);
    }

    return data;
  }, [checkIns]);

  const flatDays = useMemo(() => gridData.flat(), [gridData]);

  // Insights computation
  const stats = useMemo(() => {
    const loggedDays = flatDays.filter((d) => d.count > 0);
    const totalLogged = loggedDays.length;

    // Calmest logged day
    let calmestDay = "No logs yet";
    let minStress = 101;
    loggedDays.forEach((d) => {
      if (d.avgStress < minStress && d.avgStress >= 0) {
        minStress = d.avgStress;
        const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" };
        calmestDay = d.date.toLocaleDateString("en-US", options);
      }
    });

    // Hardest stretch: find a sliding window of 4 days in flatDays with the supreme accumulated stress
    let hardestRange = "No high friction stretch logged";
    let maxStretchAvg = 0;
    
    if (flatDays.length >= 4) {
      for (let i = 0; i <= flatDays.length - 4; i++) {
        const slice = flatDays.slice(i, i + 4);
        const loggedSlice = slice.filter(d => d.count > 0);
        if (loggedSlice.length >= 2) {
          const sum = loggedSlice.reduce((acc, curr) => acc + curr.avgStress, 0);
          const avg = sum / loggedSlice.length;
          if (avg > maxStretchAvg) {
            maxStretchAvg = avg;
            const startOpt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
            const endOpt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
            hardestRange = `${slice[0].date.toLocaleDateString("en-US", startOpt)} – ${slice[3].date.toLocaleDateString("en-US", endOpt)}`;
          }
        }
      }
    }

    // Current Streak calculation
    let currentStreak = 0;
    const sortedDays = [...flatDays].sort((a, b) => b.date.getTime() - a.date.getTime());
    // Start measuring from today or yesterday
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const hasLogToday = checkIns.some(c => c.date === todayStr);
    const hasLogYesterday = checkIns.some(c => c.date === yesterdayStr);

    if (hasLogToday || hasLogYesterday) {
      let runDate = hasLogToday ? new Date() : yesterday;
      while (true) {
        const runStr = runDate.toISOString().split("T")[0];
        const hasLog = checkIns.some(c => c.date === runStr);
        if (hasLog) {
          currentStreak++;
          runDate.setDate(runDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      totalLogged,
      calmestDay: minStress <= 100 ? `${calmestDay} (${Math.round(minStress)}%)` : "No entries",
      hardestRange: maxStretchAvg > 0 ? `${hardestRange} (Avg ${Math.round(maxStretchAvg)}%)` : "None recorded",
      currentStreak,
    };
  }, [flatDays, checkIns]);

  // Color mapper
  const getColor = (avgStress: number) => {
    if (avgStress === -1) return "#EDE8E0"; // No data
    if (avgStress <= 30) return stealthActive ? "#3B82F6" : "#1E6645"; // forest green (or blue in stealth)
    if (avgStress <= 55) return stealthActive ? "#60A5FA" : "#C47B1A"; // amber
    if (avgStress <= 75) return stealthActive ? "#F59E0B" : "#A63D2F"; // rust (or intermediate orange in stealth)
    return stealthActive ? "#EF4444" : "#7C2D3E"; // wine (or bright red in stealth)
  };

  // Month labels: find index where a month changes or displays
  const monthLabels = useMemo(() => {
    const labels: { text: string; colIdx: number }[] = [];
    let prevMonth = "";
    
    gridData.forEach((week, colIdx) => {
      // Check the Wednesday of the week to tag the label fairly
      const midDay = week[3];
      const mName = midDay.date.toLocaleDateString("en-US", { month: "short" });
      if (mName !== prevMonth) {
        labels.push({ text: mName, colIdx });
        prevMonth = mName;
      }
    });

    return labels;
  }, [gridData]);

  const rowLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div id="friction_heatmap_view" className="space-y-6">
      
      {/* Editorial Header */}
      <div className="border-b border-gray-150 pb-4">
        <h1 className={`text-3xl font-bold font-serif tracking-tight ${stealthActive ? "text-gray-900" : "text-[#1A1414]"}`}>
          {stealthActive ? "Task & Activity Matrix" : "Friction Intensity Heatmap"}
        </h1>
        <p className="text-xs font-sans text-gray-500 mt-1 uppercase tracking-wider font-semibold">
          {stealthActive ? "Visual log of schedule completion patterns" : "90-day comprehensive audit of household friction triggers"}
        </p>
      </div>

      {/* Main Grid Card */}
      <div className="bg-white border border-[#EDE8E0] rounded-xl p-6 shadow-sm relative overflow-visible">
        
        {/* Section label */}
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#7A6860] block mb-4">
          {stealthActive ? "ACTIVITY SCHEDULES" : "DOMESTIC FRICTION TIMELINE"}
        </span>

        {/* Heatmap Visualized Container */}
        <div className="flex flex-col items-start overflow-x-auto pb-4">
          <div className="min-w-[640px]">
            {/* Months row */}
            <div className="flex pl-8 mb-2 h-4 text-[10px] font-semibold text-[#7A6860] uppercase tracking-wider relative">
              {monthLabels.map((lbl, idx) => (
                <div
                  key={idx}
                  className="absolute"
                  style={{ left: `${32 + lbl.colIdx * 43}px` }}
                >
                  {lbl.text}
                </div>
              ))}
            </div>

            {/* Grid Row layout */}
            <div className="flex">
              {/* Day Labels Column */}
              <div className="flex flex-col gap-[3px] text-[10px] font-semibold text-gray-400 w-8 pr-2 pt-[2px] justify-between h-[155px]">
                {rowLabels.map((r, i) => (
                  <span key={i} className="text-right inline-block h-[19px]">
                    {r}
                  </span>
                ))}
              </div>

              {/* Weeks grid */}
              <div className="flex gap-[3px]">
                {gridData.map((week, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-[3px]">
                    {week.map((day, rowIdx) => {
                      const bgCol = getColor(day.avgStress);
                      return (
                        <div
                          key={rowIdx}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredDay({
                              dateStr: day.dateStr,
                              avgStress: day.avgStress,
                              count: day.count,
                              dayName: day.dayName,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          style={{ backgroundColor: bgCol }}
                          className="w-[19px] h-[19px] rounded-sm transition-all hover:scale-110 cursor-help"
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs pt-4 border-t border-[#EDE8E0]">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-sans text-[11px]">Friction Level:</span>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-sm bg-[#EDE8E0]" />
              <span className="text-[10px] text-[#7A6860] uppercase tracking-wider font-extrabold mr-2">No Logs</span>
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: stealthActive ? "#3B82F6" : "#1E6645" }} />
              <span className="text-[10px] text-[#7A6860] uppercase tracking-wider font-extrabold mr-2">Clear (0-30%)</span>
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: stealthActive ? "#60A5FA" : "#C47B1A" }} />
              <span className="text-[10px] text-[#7A6860] uppercase tracking-wider font-extrabold mr-2">Medium (31-55%)</span>
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: stealthActive ? "#F59E0B" : "#A63D2F" }} />
              <span className="text-[10px] text-[#7A6860] uppercase tracking-wider font-extrabold mr-2">High (56-75%)</span>
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: stealthActive ? "#EF4444" : "#7C2D3E" }} />
              <span className="text-[10px] text-[#7A6860] uppercase tracking-wider font-extrabold">Severe (76%+)</span>
            </div>
          </div>

          <p className="text-[11px] font-sans text-gray-500 font-medium">
            <strong>{stats.totalLogged}</strong> days logged in last 90 days.
          </p>
        </div>
      </div>

      {/* Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Calmest day */}
        <div className="bg-white border border-[#EDE8E0] rounded-xl p-5 shadow-sm">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7A6860] block">
            {stealthActive ? "PEAK COGNITIVE FLEXIBILITY" : "CALMEST DAY RECORDED"}
          </span>
          <h4 className={`text-lg font-serif font-bold text-brand-green mt-1 text-[#1E6645]`}>
            {stats.calmestDay}
          </h4>
          <p className="text-[10px] font-sans text-gray-400 mt-1">
            {stealthActive ? "Days with maximum scheduled study hours" : "Lowest logged household tension levels"}
          </p>
        </div>

        {/* Hardest stretch */}
        <div className="bg-white border border-[#EDE8E0] rounded-xl p-5 shadow-sm">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7A6860] block">
            {stealthActive ? "HIGHEST CONFLICT WINDOWS" : "HARDEST STRETCH"}
          </span>
          <h4 className="text-lg font-serif font-bold text-amber-600 mt-1 text-[#C47B1A]">
            {stats.hardestRange}
          </h4>
          <p className="text-[10px] font-sans text-gray-400 mt-1">
            {stealthActive ? "Consecutive high overhead intervals" : "4-day rolling window of high friction"}
          </p>
        </div>

        {/* Streak */}
        <div className="bg-white border border-[#EDE8E0] rounded-xl p-5 shadow-sm">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7A6860] block">
            {stealthActive ? "AUDITED LOG STREAK" : "CURRENT LOGGING STREAK"}
          </span>
          <h4 className="text-lg font-serif font-bold text-[#7C2D3E] mt-1">
            {stats.currentStreak} {stats.currentStreak === 1 ? "Day" : "Days"}
          </h4>
          <p className="text-[10px] font-sans text-gray-400 mt-1">
            {stealthActive ? "Unbroken daily routine updates" : "Consecutive days protecting sovereignty"}
          </p>
        </div>
      </div>

      {/* Description / Info Card */}
      <div className="p-4 rounded-xl border border-orange-100 bg-amber-50/20 flex gap-3 text-xs leading-relaxed text-[#7A6860]">
        <Info className="flex-shrink-0 text-amber-700 w-4 h-4 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-950 font-serif">Deep Sovereignty Insights</p>
          <p className="mt-0.5 font-sans">
            This map displays your domestic friction telemetry over the past quarter. Each box marks an individual day. Hover to trace trends, identify recurrent patterns, and protect critical study windows before relatives or responsibilities request them.
          </p>
        </div>
      </div>

      {/* Floating Tooltip Custom rendering */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: "fixed",
              left: `${hoveredDay.x}px`,
              top: `${hoveredDay.y}px`,
              transform: "translate(-50%, -100%)",
            }}
            className="z-50 bg-slate-900 text-white rounded-lg px-3 py-2 text-xs font-sans shadow-xl pointer-events-none mb-1 text-center border border-slate-700 max-w-[190px]"
          >
            <p className="font-bold border-b border-slate-700 pb-1 mb-1">
              {hoveredDay.dayName}, {hoveredDay.dateStr}
            </p>
            <p className="text-[11px] text-slate-300">
              {hoveredDay.avgStress === -1 ? (
                <span>No incidents logged</span>
              ) : (
                <span>
                  Avg Tension: <strong className="text-amber-400">{Math.round(hoveredDay.avgStress)}%</strong>
                </span>
              )}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {hoveredDay.count} {hoveredDay.count === 1 ? "audit session" : "audit sessions"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
