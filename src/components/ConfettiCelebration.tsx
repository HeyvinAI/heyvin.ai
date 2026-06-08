import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Award, Shield, CheckCircle2, ArrowRight } from "lucide-react";

interface ConfettiCelebrationProps {
  onClose: () => void;
  stealthActive: boolean;
}

interface Particle {
  id: number;
  x: number; // initial left %
  y: number; // initial top %
  size: number;
  color: string;
  delay: number;
  duration: number;
  angle: number;
  rotateSpeed: number;
  shape: "circle" | "square" | "triangle";
}

const COLORS_NORMAL = ["#7C2D3E", "#A03C54", "#D26B82", "#E8B382", "#845EC2", "#FF9671"];
const COLORS_STEALTH = ["#2563EB", "#3B82F6", "#60A5FA", "#10B981", "#059669", "#64748B"];

export default function ConfettiCelebration({ onClose, stealthActive }: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = stealthActive ? COLORS_STEALTH : COLORS_NORMAL;
    const items: Particle[] = [];
    
    // Generate 80 high-impact confetti particles sliding/drifting gracefully
    for (let i = 0; i < 80; i++) {
      items.push({
        id: i,
        x: Math.random() * 100, // percentage across width
        y: -10 - Math.random() * 20, // start slightly above screen
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.4,
        duration: Math.random() * 2.8 + 2.2,
        angle: Math.random() * 360,
        rotateSpeed: Math.random() * 720 - 360,
        shape: ["circle", "square", "triangle"][Math.floor(Math.random() * 3)] as any,
      });
    }
    setParticles(items);

    // Auto cleanup or allow close after 6 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 8500);

    return () => clearTimeout(timer);
  }, [stealthActive, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-hidden font-sans select-none">
      {/* 1. Confetti Elements Falling Down */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => {
          const isTriangle = p.shape === "triangle";
          const isCircle = p.shape === "circle";
          
          return (
            <motion.div
              key={p.id}
              initial={{ 
                x: `${p.x}vw`, 
                y: `${p.y}vh`, 
                rotate: p.angle, 
                opacity: 0.9 
              }}
              animate={{
                y: "105vh",
                x: `${p.x + (Math.random() * 16 - 8)}vw`, // slight sway
                rotate: p.angle + p.rotateSpeed,
                opacity: 0.1
              }}
              transition={{
                delay: p.delay,
                duration: p.duration,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                width: isTriangle ? 0 : p.size,
                height: isTriangle ? 0 : p.size,
                backgroundColor: isTriangle ? "transparent" : p.color,
                borderRadius: isCircle ? "50%" : "2px",
                borderLeft: isTriangle ? `${p.size / 2}px solid transparent` : undefined,
                borderRight: isTriangle ? `${p.size / 2}px solid transparent` : undefined,
                borderBottom: isTriangle ? `${p.size}px solid ${p.color}` : undefined,
              }}
            />
          );
        })}
      </div>

      {/* 2. Celebration Box Card Layout */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 180 }}
        className="relative max-w-md w-full bg-white rounded-2xl border border-[#EDE8E0] p-6 sm:p-8 text-center space-y-6 shadow-2xl overflow-hidden"
      >
        {/* Aesthetic design background highlight circle */}
        <div className={`absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl opacity-10 transition-colors ${
          stealthActive ? "bg-blue-600" : "bg-[#7C2D3E]"
        }`} />
        <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-10 transition-colors ${
          stealthActive ? "bg-emerald-600" : "bg-amber-600"
        }`} />

        {/* Celebratory Icon Header */}
        <div className="flex justify-center">
          <div className={`relative p-4 rounded-full transition-colors ${
            stealthActive ? "bg-blue-50 text-blue-600" : "bg-[#7C2D3E]/10 text-[#7C2D3E]"
          }`}>
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {stealthActive ? <Shield className="w-8 h-8" /> : <Award className="w-8 h-8" />}
            </motion.div>
            
            {/* Twinkler sparkle nodes */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </motion.div>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <span className={`text-[10px] font-mono uppercase tracking-widest font-extrabold ${
            stealthActive ? "text-blue-600" : "text-[#7C2D3E]"
          }`}>
            {stealthActive ? "Syllabus Targets Met" : "Ground Held Successfully"}
          </span>
          <h2 className="text-2xl font-bold font-serif text-[#1A1414] leading-snug">
            {stealthActive ? "Study Checkpoints Clear!" : "Sovereignty Fully Secured!"}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            {stealthActive ? (
              "Every syllabus task scheduled for today has been checked off and neutralized. Your technical discipline is impenetrable."
            ) : (
              "Every single task on your list has been checked off. You carved out your academic focus windows and defended your time against domestic friction today."
            )}
          </p>
        </div>

        {/* Encouraging Sisterly Note from Heyvin */}
        <div className="bg-[#FAF9F6] border border-[#EDE8E0] rounded-xl p-4 text-left relative overflow-hidden">
          <div className="flex gap-2.5 items-start">
            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              stealthActive ? "text-blue-600" : "text-[#7C2D3E]"
            }`} />
            <div>
              <p className="text-xs font-serif italic text-gray-700 leading-relaxed font-medium">
                {stealthActive ? (
                  "“This is pure momentum. Your core logic is solid, and consistency is the silent shield that builds careers. Clear your mind, rest well, and show up again tomorrow.”"
                ) : (
                  "“I hope you can feel how powerful you are. When chores and family gravity attempted to split your day, you said 'No' respectfully and stayed on your track. Keep this fire burning.”"
                )}
              </p>
              <div className="mt-2 text-[10px] font-sans font-semibold uppercase text-gray-400 tracking-wider">
                — Heyvin's Sister Wisdom
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          <button
            id="close_confetti_button"
            onClick={onClose}
            className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 shadow-md ${
              stealthActive 
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10" 
                : "bg-[#7C2D3E] hover:bg-[#913B4E] shadow-[#7C2D3E]/10"
            }`}
          >
            <span>Continue to Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </motion.div>
    </div>
  );
}
