import React from "react";
import { 
  Crown, Sparkles, BookText, FileText, 
  Users, Compass, MapIcon, Moon, CheckCircle, ArrowRight 
} from "lucide-react";

interface PremiumUnlockScreenProps {
  onUnlock: () => void;
  featureName: string;
}

export const PremiumUnlockScreen: React.FC<PremiumUnlockScreenProps> = ({ onUnlock, featureName }) => {
  return (
    <div id="premium_unlock_screen" className="w-full max-w-4xl mx-auto py-8 px-4 font-sans text-left animate-fadeIn">
      
      {/* Luxury Golden Glow Card */}
      <div className="bg-gradient-to-br from-amber-950 via-[#40121a] to-amber-900 text-orange-50 rounded-2xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        
        {/* Background Sparkles Grid */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] -translate-y-12 pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-[300px] h-[300px] bg-[#E28E75]/15 rounded-full blur-[80px] pointer-events-none" />

        {/* Floating Crown Accent */}
        <div className="absolute top-6 right-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 rotate-12 shrink-0 animate-bounce">
          <Crown size={24} />
        </div>

        <div className="max-w-2xl space-y-6 relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-[10px] uppercase tracking-widest leading-none">
            <Sparkles size={11} className="text-amber-300 animate-spin-slow" /> HEYVIN SOVEREIGN PREMIUM
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white">
              Unlock Sovereignty Gold Tier
            </h2>
            <p className="text-sm text-rose-100 leading-relaxed max-w-xl">
              You clicked on the <strong className="text-amber-300">"{featureName}"</strong> tool. This is a secure personal auditor feature reserved exclusively for Heyvin Sovereign Premium access keycards.
            </p>
          </div>

          {/* Premium Value Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-b border-white/10 my-4 text-xs">
            
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                <BookText size={15} />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-white block">Sovereign Chronicles Journal</span>
                <span className="text-rose-200/80 text-[11px] leading-relaxed block">
                  Write freely and let your personal older sister AI analyze cognitive stressors, domestic patterns, and boundary advice securely.
                </span>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                <FileText size={15} />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-white block">Sovereignty Weekly Report Cards</span>
                <span className="text-rose-200/80 text-[11px] leading-relaxed block">
                  Full exportable PDFs tracking exact hours reclaimed from chores, power outages, and generator schedules.
                </span>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                <Users size={15} />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-white block">Safe Circles Global Directory</span>
                <span className="text-rose-200/80 text-[11px] leading-relaxed block">
                  Join supportive peers in Lagos, New Delhi, and CDMX. Rehearse boundaries together without sharing identity.
                </span>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                <MapIcon size={15} />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-white block">Friction Heatmaps & Predictions</span>
                <span className="text-rose-200/80 text-[11px] leading-relaxed block">
                  Interactive visual calendars modeling generator noise schedules, unannounced visits, and chore peaks.
                </span>
              </div>
            </div>

            <div className="flex gap-3 items-start md:col-span-2">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                <Moon size={15} />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-white block">Haven Midnights Theme</span>
                <span className="text-rose-200/80 text-[11px] leading-relaxed block">
                  Full access to eye-safe Midnight dark mode optimized for late-night studying under candle light or generator pressure.
                </span>
              </div>
            </div>

          </div>

          {/* Pricing & Activation Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-rose-300 block font-mono">SOVEREIGN ACCESS VALUE</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold font-serif">$4.99</span>
                <span className="text-rose-200/60 text-xs">/ month (Free Sandbox Trigger Below)</span>
              </div>
            </div>

            <button
              onClick={onUnlock}
              className="py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 transition-all font-bold text-amber-950 text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <span>Instant Activate Premium</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>

      {/* Demo Guidance Callout */}
      <div className="mt-6 bg-amber-100/20 border border-amber-900/10 rounded-xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-amber-800 mt-0.5 shrink-0 animate-pulse" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-950">Developer Sandbox Sandbox Mode Available</p>
          <p className="text-[11px] text-amber-900/75 leading-relaxed font-sans">
            Heyvin AI integrates real sandboxed database hooks. Click <strong>"Instant Activate Premium"</strong> above to instantly simulate a secure checkout. Try accessing the Dark mode toggle, Journals, or Reports subsequently!
          </p>
        </div>
      </div>

    </div>
  );
};
