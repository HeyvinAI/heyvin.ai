import React, { useState, useEffect, useMemo } from "react";
import { db } from "../lib/supabase";
import { Task } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, X, ShieldAlert, CheckCircle2, Moon, Sun, LogOut } from "lucide-react";

interface FocusLockViewProps {
  userId: string;
  stealthActive: boolean;
  onExit: () => void;
  onSignOut: () => void;
}

export function FocusLockView({ userId, stealthActive, onExit, onSignOut }: FocusLockViewProps) {
  const [selectedDuration, setSelectedDuration] = useState<15 | 25 | 45>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "completed">("idle");
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Retrieve priority task
  const highestPriorityTask = useMemo(() => {
    const tasks = db.get<Task>(userId, "tasks");
    const uncompleted = tasks.filter((t) => !t.completed);
    return uncompleted.length > 0 ? uncompleted[0] : null;
  }, [userId]);

  // Adjust time when user changes selected duration in idle state
  useEffect(() => {
    if (status === "idle") {
      setTimeLeft(selectedDuration * 60);
    }
  }, [selectedDuration, status]);

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setStatus("completed");
      setCompletedSessionsCount((c) => c + 1);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const progressPercent = useMemo(() => {
    const totalSeconds = selectedDuration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  }, [timeLeft, selectedDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setStatus("running");
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStatus("idle");
    setTimeLeft(selectedDuration * 60);
  };

  // Safe background shift mapping during active focus
  const wrapperBg = useMemo(() => {
    if (status === "running" || isRunning) {
      return "bg-[#F3EFE7]"; // subtly shifts to slightly deeper cream
    }
    return "bg-[#FAF7F2]";
  }, [status, isRunning]);

  return (
    <div className={`fixed inset-0 min-h-screen z-50 flex flex-col justify-between p-6 transition-all duration-1000 ${wrapperBg}`}>
      
      {/* Top Header Row */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <span className="font-serif italic font-extrabold text-lg tracking-tight text-[#7C2D3E]">
            {stealthActive ? "StudySync Focus" : "Heyvin Lock-In Mode"}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#7C2D3E]/10 text-[#7C2D3E] font-sans text-[8px] font-bold tracking-widest uppercase">
            {stealthActive ? "Syllabus Shield" : "Sovereignty Shield"}
          </span>
        </div>

        {/* Global Safety Signout and Exit */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSignOut}
            className="px-3 py-1.5 rounded-xl bg-[#F07A70]/10 border border-[#F07A70]/30 hover:bg-[#F07A70]/20 text-[#A63D2F] font-sans font-bold uppercase text-[9px] tracking-wider flex items-center gap-1 cursor-pointer transition-all"
            title="Sign out instantly"
          >
            <LogOut size={12} />
            <span>Instant Sign Out</span>
          </button>

          <button
            onClick={onExit}
            className="p-2 rounded-xl hover:bg-gray-205 border border-transparent hover:border-[#EDE8E0] transition-all cursor-pointer flex items-center justify-center bg-white shadow-sm"
            title="Return to standard dashboard"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Focus Target Body */}
      <main className="flex-1 max-w-xl w-full mx-auto flex flex-col items-center justify-center space-y-8 text-center my-auto">
        <AnimatePresence mode="wait">
          {status === "completed" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
              key="completed-screen"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#1E6645] animate-bounce">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-3xl font-serif font-extrabold text-[#1A1414] tracking-tight">
                Session Complete. <br />You did that. 💜
              </h2>

              <p className="text-xs font-sans text-gray-500 max-w-sm mx-auto">
                {stealthActive 
                  ? "Your academic preparation hours were successfully recorded."
                  : "You successfully guarded your sovereignty space and blocked out household distractions."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full max-w-xs mx-auto">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider font-sans bg-[#7C2D3E] hover:bg-[#60202e] text-white cursor-pointer transition-all"
                >
                  Start Another
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider font-sans border border-[#EDE8E0] bg-white text-[#7A6860] hover:bg-gray-50 cursor-pointer transition-all"
                >
                  Return Home
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 w-full"
              key="focus-screen"
            >
              {/* Shield lock active label */}
              <div className="flex items-center gap-1.5 justify-center py-1.5 px-4 rounded-full bg-orange-50/70 border border-orange-100/50 w-max mx-auto">
                <ShieldAlert size={14} className="text-[#C47B1A] animate-pulse" />
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#7A6860]">
                  {status === "running" ? "CONE OF FOCUS ACTIVE" : "LOCK-IN PREPARATION"}
                </span>
              </div>

              {/* Focus Task Card with large serif presentation */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400">
                  CURRENT SINGLE PRIORITY
                </span>

                <h1 className="text-2.5xl sm:text-3.5xl font-serif font-extrabold tracking-tight text-[#1A1414] balance max-w-lg mx-auto">
                  {highestPriorityTask ? highestPriorityTask.title : (stealthActive ? "Establish Study Focus Core Plan" : "Guard Your Sovereignty Space")}
                </h1>

                {highestPriorityTask && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 border border-[#EDE8E0] text-[10px] font-bold text-gray-500 tracking-wider">
                    {highestPriorityTask.category}
                  </span>
                )}
              </div>

              {/* Pomodoro Timer Visualizer */}
              <div className="py-6 flex flex-col items-center">
                {/* Large countdown timer text */}
                <div className="font-serif text-7xl sm:text-8xl tracking-tighter text-[#7C2D3E] font-medium font-bold select-none leading-none mb-1">
                  {formatTime(timeLeft)}
                </div>

                {/* Inline loading bar indicator */}
                {status !== "idle" && (
                  <div className="w-56 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-[#7C2D3E] transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}

                {/* Duration select pills shown only when idle */}
                {status === "idle" && (
                  <div className="flex items-center gap-2 mt-4 bg-white p-1 rounded-xl border border-[#EDE8E0] shadow-2xs">
                    {([15, 25, 45] as const).map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        className={`px-3 py-1 text-[11px] font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
                          selectedDuration === dur
                            ? "bg-[#7C2D3E] text-white"
                            : "text-[#7A6860] hover:bg-gray-50 hover:text-[#1A1414]"
                        }`}
                      >
                        {dur} Min
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="max-w-xs mx-auto">
                {status === "idle" ? (
                  <button
                    onClick={handleStart}
                    className="w-full py-3 rounded-xl font-bold tracking-wider text-xs uppercase font-sans bg-[#7C2D3E] hover:bg-[#60202e] text-white cursor-pointer transition-all shadow-md"
                  >
                    Lock In · {selectedDuration} Min
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {isRunning ? (
                      <button
                        onClick={handlePause}
                        className="flex-1 py-3 rounded-xl font-bold tracking-wider text-xs uppercase font-sans bg-[#C47B1A] hover:bg-amber-750 text-white cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Pause size={14} />
                        <span>Pause Focus</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStart}
                        className="flex-1 py-3 rounded-xl font-bold tracking-wider text-xs uppercase font-sans bg-[#7C2D3E] hover:bg-[#60202e] text-white cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Play size={14} />
                        <span>Resume</span>
                      </button>
                    )}

                    <button
                      onClick={handleReset}
                      className="p-3 bg-white border border-[#EDE8E0] hover:bg-gray-50 rounded-xl text-gray-500 cursor-pointer transition-all"
                      title="Reset Session"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Footer block */}
      <footer className="text-center font-sans">
        <p className="text-[10px] text-gray-400">
          {stealthActive 
            ? "Your academic session will NOT block emergency calls or physical browser redirects is always one tap away."
            : "Heyvin cone of focus. Your interface remains accessible. Security & private exit routes are fully armed."}
        </p>
      </footer>

    </div>
  );
}
