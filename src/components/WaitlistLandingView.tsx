import React, { useState } from "react";
import { 
  Sparkles, Mail, CheckCircle, ArrowRight, ShieldCheck, 
  Trash2, Brain, Compass, Users 
} from "lucide-react";
import { saveWaitlistEmail } from "../lib/supabase";
import { HeyvinLogo } from "./HeyvinLogo";

interface WaitlistLandingViewProps {
  onNavigateToApp: () => void;
}

export const WaitlistLandingView: React.FC<WaitlistLandingViewProps> = ({ onNavigateToApp }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    source: "supabase" | "local";
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setIsSubmitting(true);
    try {
      const res = await saveWaitlistEmail(email.trim());
      if (res.success) {
        setSubmitResult({
          success: true,
          message: "You have been successfully added to the Heyvin AI waitlist! We will notify you of upcoming sovereignty releases.",
          source: res.source
        });
        setEmail("");
      } else {
        setSubmitResult({
          success: false,
          message: res.error || "Could not register code at this time. Please try again.",
          source: "local"
        });
      }
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: err.message || "An unexpected error occurred. Please try again.",
        source: "local"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#1A1414] font-sans flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-x-hidden selection:bg-[#7C2D3E]/10 selection:text-[#7C2D3E]">
      
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#E28E75]/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-[#EDE8E0] mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <HeyvinLogo size={34} glowOpacity={0.08} />
          <div className="flex flex-col text-left">
            <span className="font-serif font-black uppercase tracking-[0.15em] text-[#1A1414] text-base leading-none">HEYVIN AI</span>
            <span className="text-[9px] font-bold text-amber-900/60 uppercase tracking-wider leading-none mt-1">
              SOVEREIGN STUDY COMPANION
            </span>
          </div>
        </div>
        <button 
          onClick={onNavigateToApp}
          className="px-4 py-2 rounded-xl text-xs uppercase font-extrabold tracking-widest bg-[#7C2D3E] hover:bg-[#60202e] text-white transition-all cursor-pointer shadow-xs whitespace-nowrap"
        >
          Enter App
        </button>
      </header>

      {/* Main Hero & Split Layout */}
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center space-y-12 py-4 relative z-10 my-auto">
        
        {/* Split Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left w-full">
          
          {/* Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100/50 text-[#7C2D3E] font-semibold text-[10px] uppercase tracking-wider">
              <Sparkles size={10} className="text-[#7C2D3E]" /> Heyvin AI Waitlist Portal
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-[#1A1414] leading-tight">
              Quiet focus is not <br />
              <span className="text-[#7C2D3E]">a luxury. It is a right.</span>
            </h1>
            
            <p className="text-sm sm:text-base text-[#7A6860] leading-relaxed font-sans max-w-xl">
              Meet <strong>Heyvin AI</strong> — the world’s first local-first success companion and behavioral auditor designed specifically for ambitious young women carving out study hours from demanding environments. Protect your boundaries with an active AI sister guide.
            </p>

            {/* Waitlist Form Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EDE8E0] shadow-xl hover:border-[#E28E75]/30 transition-all space-y-6 max-w-xl relative">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#7C2D3E]">
                  Secure Your Priority Key
                </h3>
                <p className="text-xs text-[#7A6860]">
                  Get immediate access to boundary-tracking toolkits and exclusive previews.
                </p>
              </div>

              {submitResult?.success ? (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-3 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-600 mt-0.5 shrink-0" size={18} />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-emerald-950">You're on the list!</p>
                      <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
                        {submitResult.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-emerald-100">
                    <span className="text-[8px] uppercase tracking-widest font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-sm">
                      {submitResult.source === "supabase" ? "CONNECTED CLOUD SECURE" : "LOCAL BACKUP REGISTERED"}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter study-safe email address..."
                      className="block w-full pl-10 pr-3.5 py-3 border border-[#EDE8E0] rounded-xl text-xs sm:text-sm bg-[#FAF8F5] focus:outline-hidden focus:ring-1 focus:ring-[#7C2D3E] focus:border-[#7C2D3E] focus:bg-white transition-all text-[#1A1414] placeholder-gray-400 font-sans"
                    />
                  </div>

                  {submitResult && !submitResult.success && (
                    <p className="text-[10px] text-[#7C2D3E] font-medium animate-fadeIn">
                      ⚠️ {submitResult.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim() || !email.includes("@")}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#7C2D3E] hover:bg-[#60202e] disabled:opacity-40 transition-all cursor-pointer shadow-md active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? "Registering..." : "Join the Exclusive Waitlist"}</span>
                    <ArrowRight size={12} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Core Feature Bento Elements */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Headline Box */}
            <div className="bg-[#FAF8F5] border border-[#EDE8E0] rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-serif font-black uppercase text-[#1A1414] tracking-tight">
                Our Solution Philosophy
              </h2>
              <p className="text-xs text-[#7A6860] leading-relaxed font-sans">
                Most productivity software assumes you live in a quiet, sterile dorm room with uninterrupted high-speed Wi-Fi and zero family obligations. Heyvin AI was built for real lives.
              </p>
              
              {/* Solution Pill Features */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#EDE8E0]/60">
                  <div className="p-1.5 bg-rose-50 rounded-md text-[#7C2D3E]">
                    <Brain size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-[#1A1414]">Conversational Boundary Rehearsal</p>
                    <p className="text-[9.5px] text-[#7A6860]">Roleplay hard family negotiations in absolute privacy.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#EDE8E0]/60">
                  <div className="p-1.5 bg-amber-50 rounded-md text-[#EDB870]">
                    <Compass size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-[#1A1414]">Sovereignty Score & Trackers</p>
                    <p className="text-[9.5px] text-[#7A6860]">Quantify focus interruptions and hours reclaimed.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#EDE8E0]/60">
                  <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-[#1A1414]">Secure Dual-Sync Database</p>
                    <p className="text-[9.5px] text-[#7A6860]">Private local state instantly links to Supabase under RLS.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to App Entry Callout */}
            <div className="bg-amber-100/20 border border-amber-900/10 rounded-2xl p-6 text-center space-y-3">
              <p className="text-xs font-serif font-bold italic text-amber-950">
                "We want to make sure your career development remains entirely yours."
              </p>
              <button 
                onClick={onNavigateToApp}
                className="w-full py-2.5 px-4 rounded-xl text-[11px] font-extrabold uppercase tracking-widest text-[#7C2D3E] bg-white border border-[#E28E75]/30 hover:bg-orange-50 transition-all cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <span>Launch Interactive Showcase</span>
                <ArrowRight size={12} />
              </button>
            </div>

          </div>

        </div>

        {/* Highlight Section: Problem Statement (3 Bullets) */}
        <div className="w-full pt-8 border-t border-[#EDE8E0]">
          <div className="text-center space-y-2 mb-8">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#7C2D3E]">Lived Experience</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1414]">
              The Invisible Friction Ambitious Women Face
            </h2>
            <p className="text-xs text-[#7A6860] max-w-xl mx-auto font-sans">
              Traditional study and goal tracking fails because it ignores the domestic tax that community, home situations, and expectations put on young girls in developing cities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Problem Bullet 1 */}
            <div className="bg-white p-6 rounded-2xl border border-[#EDE8E0] space-y-3 hover:shadow-md transition-all">
              <span className="text-2xl font-serif font-black text-[#7C2D3E]">01</span>
              <h3 className="text-sm font-bold text-[#1A1414] uppercase tracking-wide">
                Constant Distraction Taxes
              </h3>
              <p className="text-xs text-[#7A6860] leading-relaxed font-sans">
                Household chores, unannounced uncle visits, loud generators, or street noise. High-stress environments deplete cognitive reserves before you even open your terminal or open your textbook.
              </p>
            </div>

            {/* Problem Bullet 2 */}
            <div className="bg-white p-6 rounded-2xl border border-[#EDE8E0] space-y-3 hover:shadow-md transition-all">
              <span className="text-2xl font-serif font-black text-[#E28E75]">02</span>
              <h3 className="text-sm font-bold text-[#1A1414] uppercase tracking-wide">
                Apologizing For Needing Space
              </h3>
              <p className="text-xs text-[#7A6860] leading-relaxed font-sans">
                Young women feel an implicit pressure to prioritize everyone else’s needs. Setting standard 2-hour physical boundaries in a communal living environment is met with friction and guilt.
              </p>
            </div>

            {/* Problem Bullet 3 */}
            <div className="bg-white p-6 rounded-2xl border border-[#EDE8E0] space-y-3 hover:shadow-md transition-all">
              <span className="text-2xl font-serif font-black text-[#EDB870]">03</span>
              <h3 className="text-sm font-bold text-[#1A1414] uppercase tracking-wide">
                Privacy Exposure Risks
              </h3>
              <p className="text-xs text-[#7A6860] leading-relaxed font-sans">
                Exposing goals, exam schedules, or application portfolios to unsupportive micro-climates invites discouragement and interference. Your progress metrics must be completely secure.
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Footer Area */}
      <footer className="w-full max-w-5xl text-center py-6 border-t border-[#EDE8E0] mt-12 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-[#7A6860] font-mono">
          &copy; {new Date().getFullYear()} Heyvin AI. Restoring your Sovereignty securely.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onNavigateToApp} 
            className="text-[10px] uppercase font-bold tracking-wider text-[#7C2D3E] hover:underline cursor-pointer"
          >
            Launch Interactive Prototype
          </button>
        </div>
      </footer>

    </div>
  );
};
