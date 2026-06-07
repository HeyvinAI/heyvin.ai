import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Brain, ArrowRight, CheckCircle2, ChevronRight, HelpCircle, CornerDownRight, Volume2, Shield } from "lucide-react";
import { RehearseSession, UserProfile } from "../types";
import { db } from "../lib/supabase";
import { getAffirmation } from "../data/affirmations";
import { generateGeminiContent } from "../lib/gemini";

interface RehearsePlaygroundProps {
  user: UserProfile;
  stealthActive: boolean;
  onSessionComplete: (affirmation: string) => void;
}

export interface Situation {
  id: number;
  situation: string;
  context: string;
  country: 'Niger' | 'India' | 'Mex' | 'Any';
  coachPrompt: string;
}

const situations: Situation[] = [
  {
    id: 1,
    situation: "Your elder uncle unexpectedly visits and demands you stop studying immediately to serve tea and plates to his friends in the parlor.",
    context: "Lagos / Delhi Patriarchal oversteps",
    country: "Any",
    coachPrompt: "Hold eye contact and speak with low, respectful, but absolute finality."
  },
  {
    id: 2,
    situation: "Mom demands you run a 2-hour vegetable and market errand precisely when your semester computer coding exam prep is scheduled.",
    context: "Daily household chore inflation",
    country: "Any",
    coachPrompt: "Suggest an alternative timeframe or delegation first while emphasizing the exam non-negotiable deadline."
  },
  {
    id: 3,
    situation: "Your relatives tease you at the dinner table for 'trying to act too book-smart' instead of focusing on cooking or social expectations.",
    context: "Social boundary pushback",
    country: "Any",
    coachPrompt: "Deflect with calm confidence, thanking them for the food while refusing to engage or justify your success goals."
  },
  {
    id: 4,
    situation: "Your sibling loudly blasts music in the room shared with you during your most protective study block.",
    context: "Ecosystem noise disruption",
    country: "Any",
    coachPrompt: "Set a clear boundary about split block sharing rather than starting an emotional escalation."
  }
];

export default function RehearsePlayground({ user, stealthActive, onSessionComplete }: RehearsePlaygroundProps) {
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(situations[0]);
  const [mode, setMode] = useState<'select' | 'chat' | 'result'>('select');
  const [userInput, setUserInput] = useState("");
  const [transcript, setTranscript] = useState<{ sender: 'user' | 'family' | 'coach', text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleStartPractice = (sit: Situation) => {
    setSelectedSituation(sit);
    setTranscript([
      { sender: 'family', text: sit.situation },
      { sender: 'coach', text: `Heyvin Coach: ${sit.coachPrompt}` }
    ]);
    setMode('chat');
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !selectedSituation) return;

    const userMsg = userInput.trim();
    setTranscript(prev => [...prev, { sender: 'user', text: userMsg }]);
    setUserInput("");
    setLoading(true);

    try {
      const systemPrompt = `You are Heyvin's supportive AI boundary-setting success coach. 
The user is ${user.username}, located/based in ${user.based_in || user.location}, living with: ${user.home_situation || 'family'}, with the primary goal of: ${user.primary_goal || 'starting a business'}.
The user is practicing saying "no" and establishing key study/career boundaries in their life.
Scenario they are responding to: "${selectedSituation.situation}"
Your goal is to analyze the user's rehearsal response attempt ("${userMsg}") and write a brief, warm, expert Older Sister response analyzing their boundary style.

Evaluate their attempt and categorize it dynamically into one of these:
1) "Excellent Assertive Posture" (if they are firm, gentle, polite, and set clear boundaries without apology)
2) "Appeasing Boundary Posture" (if they over-apologize, say "sorry", or ask for permission)
3) "General Avoidance" (if they don't address the boundary directly or try to escape it)

Write exactly 1 response block:
Heyvin Analysis [Selected Posture Name]: <Your detailed older sister advice here explaining what they did well, why it matters for their goal: "${user.primary_goal || 'success'}", and a practical tip about managing "${user.home_situation || 'their living boundaries'}" in "${user.based_in || user.location}">.

Write in a direct, warm, relatable older-sister voice. Bring in specific local context about living with ${user.home_situation || 'strict families'} in ${user.based_in || 'their home city'}. Keep response under 100 words.`;

      const aiResponseText = await generateGeminiContent(
        [
          { role: 'user', text: `Here is my response to the situation: "${userMsg}"` }
        ],
        systemPrompt,
        0.7
      );

      setTranscript(prev => [...prev, { 
        sender: 'coach', 
        text: aiResponseText
      }]);
      
      setFeedback(aiResponseText);
      setMode('result');
    } catch (err) {
      console.error("Gemini live practice analysis failed:", err);
      // Fallback keyword analysis if key is missing or request fails
      let score = "Excellent Assertive Posture";
      let suggestions = "Your response is firm, respectful, and establishes study blocks perfectly.";
      
      const lower = userMsg.toLowerCase();
      const referencesAcademics = lower.includes("exam") || lower.includes("study") || lower.includes("class") || lower.includes("assignment");
      
      if (lower.includes("sorry") || lower.includes("please let me") || lower.includes("beg")) {
        score = "Appeasing Boundary Posture";
        suggestions = "Avoid over-apologizing when protecting study time. You do not require permission to invest in your career.";
      } else if (!referencesAcademics) {
        score = "General Avoidance";
        suggestions = "State your objective academic deadline clearly. Relatives respect tight assignments and schedules more easily.";
      }

      const fallbackText = `Heyvin Analysis [${score}]: ${suggestions}`;
      setTranscript(prev => [...prev, { 
        sender: 'coach', 
        text: fallbackText 
      }]);
      setFeedback(fallbackText);
      setMode('result');
    } finally {
      setLoading(false);
    }
  };

  const concludeSession = () => {
    // Generate affirmation & pass back to App.tsx to display full overlay
    const randAffText = getAffirmation(85); // High stress context
    
    // Write activity to supabase Activity logs
    const activities = db.get<any>(user.uid, "circle_activity");
    activities.unshift({
      id: Math.random().toString(36).substr(2, 9),
      user_id: user.uid,
      username: user.username,
      activity_type: "rehearse",
      anonymized_label: `${user.username} completed a Rehearse session 💬`,
      created_at: new Date().toISOString()
    });
    db.save(user.uid, "circle_activity", activities);

    // Reset view
    setMode('select');
    setTranscript([]);
    
    onSessionComplete(randAffText);
  };

  return (
    <div id="rehearse_playground_container" className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${stealthActive ? "font-sans text-gray-900" : "font-serif text-amber-900"}`}>
          {stealthActive ? "Academic Practice Notes" : "Boundary Rehearsal Playground"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {stealthActive ? "Roleplay academic scheduling situations and negotiation dialogues." : "Script and practice protective boundaries. Learn how to say 'No' respectfully but with immovable finality."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'select' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <h3 className={`text-xs font-bold uppercase tracking-wider ${stealthActive ? "text-gray-500" : "text-amber-800"}`}>
              Select a Household Friction Scenario to Practice
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {situations.map((sit) => (
                <div 
                  key={sit.id}
                  className={`p-5 rounded-2xl border bg-white flex flex-col justify-between hover:shadow-md transition-all ${
                    stealthActive ? "border-gray-200" : "border-orange-100/60"
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold bg-orange-50 text-amber-800 px-2.5 py-1 rounded-full w-fit">
                      {sit.context}
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed font-sans">{sit.situation}</p>
                  </div>

                  <button
                    onClick={() => handleStartPractice(sit)}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      stealthActive 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-amber-900 hover:bg-amber-950 text-orange-50"
                    }`}
                  >
                    <span>Practice Response</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {mode === 'chat' && selectedSituation && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 rounded-2xl border bg-white space-y-6 shadow-sm ${
              stealthActive ? "border-gray-200" : "border-orange-100/50"
            }`}
          >
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Practice Session</span>
              <button 
                onClick={() => setMode('select')}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Exit Session
              </button>
            </div>

            {/* Simulated transcript logs */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {transcript.map((line, idx) => {
                let align = "justify-start";
                let bubble = "bg-gray-100 text-gray-800 rounded-br-2xl";
                let senderName = stealthActive ? "Opponent" : "Family Friction";

                if (line.sender === 'user') {
                  align = "justify-end";
                  bubble = stealthActive ? "bg-blue-600 text-white rounded-bl-2xl" : "bg-amber-900 text-orange-50 rounded-bl-2xl";
                  senderName = "You";
                } else if (line.sender === 'coach') {
                  align = "justify-start";
                  bubble = "bg-green-50 border border-green-100 text-green-800 rounded-br-2xl";
                  senderName = stealthActive ? "Negotiation Guide" : "Heyvin AI Coach";
                }

                return (
                  <div key={idx} className={`flex flex-col ${align} space-y-1`}>
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider px-1">
                      {senderName}
                    </span>
                    <div className={`p-3 text-xs leading-relaxed max-w-md rounded-tl-2xl rounded-tr-2xl ${bubble}`}>
                      {line.text}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start items-center gap-2 py-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
              )}
            </div>

            {/* Text input form */}
            <form onSubmit={handleSendResponse} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="How do you decline? Type your exact words..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 text-xs text-gray-800 font-serif"
                style={{ fontFamily: stealthActive ? 'Inter' : 'Lora' }}
              />
              <button
                type="submit"
                className={`px-4 py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer ${
                  stealthActive ? "bg-blue-600 hover:bg-blue-700" : "bg-[#E28E75] hover:bg-[#B06450]"
                }`}
              >
                <span>Respond</span>
                <Volume2 size={14} />
              </button>
            </form>

            {/* Suggested Answers Cheat-Sheet */}
            <div className="space-y-2 pt-2 border-t border-gray-100/75">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 block font-sans">
                {stealthActive ? "Option Templates (Single-click fill)" : "Suggested Assertive Script Templates (Click to fill)"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedSituation.id === 1 && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => setUserInput("I am happy to greet Uncle first, but I need to complete this timed practice chapter before I can help serve.")} 
                      className="px-3 py-2 text-left rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 hover:border-gray-200 transition-all font-sans text-xs text-gray-600 cursor-pointer"
                    >
                      💡 <strong>Greet first, work after:</strong> "I am happy to greet Uncle first, but I need..."
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setUserInput("Uncle, welcome! I will greet you briefly, but I am currently in the middle of a non-negotiable academic mock test.")} 
                      className="px-3 py-2 text-left rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 hover:border-gray-200 transition-all font-sans text-xs text-gray-600 cursor-pointer"
                    >
                      💡 <strong>Time boundary:</strong> "Uncle, welcome! ... I am in the middle of a non-negotiable..."
                    </button>
                  </>
                )}
                {selectedSituation.id === 2 && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => setUserInput("Mom, I absolute want to run the chores! I will go to the market at 4 PM right after this online exam ends.")} 
                      className="px-3 py-2 text-left rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 hover:border-gray-200 transition-all font-sans text-xs text-gray-600 cursor-pointer"
                    >
                      💡 <strong>Delay Proposal:</strong> "Mom, I absolute want to do it! I can go at 4 PM right after..."
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setUserInput("This exam represents 30% of my semester grade. Let's delegate this run to my sibling or do it later tonight.")} 
                      className="px-3 py-2 text-left rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 hover:border-gray-200 transition-all font-sans text-xs text-gray-600 cursor-pointer"
                    >
                      💡 <strong>Explain Grade Impact:</strong> "This exam represents 30% of my semester grade..."
                    </button>
                  </>
                )}
                {selectedSituation.id === 3 && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => setUserInput("Thank you! I find these studies extremely exciting because they help me build a real career.")} 
                      className="px-3 py-2 text-left rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 hover:border-gray-200 transition-all font-sans text-xs text-gray-600 cursor-pointer"
                    >
                      💡 <strong>Deflection with warmth:</strong> "Thank you! I find these studies exciting because they..."
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setUserInput("Cooking is a great skill, and so is starting a brand. I am proud to invest high quality hours in both.")} 
                      className="px-3 py-2 text-left rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 hover:border-gray-200 transition-all font-sans text-xs text-gray-600 cursor-pointer"
                    >
                      💡 <strong>Dual competence:</strong> "Cooking is a great skill, and so is starting a brand..."
                    </button>
                  </>
                )}
                {selectedSituation.id === 4 && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => setUserInput("Can we split the room schedule? If you wear headphones for 2 hours, the room is yours for music the rest of the day.")} 
                      className="px-3 py-2 text-left rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 hover:border-gray-200 transition-all font-sans text-xs text-gray-600 cursor-pointer"
                    >
                      💡 <strong>Cooperative Split:</strong> "Can we split the room schedule? If you wear..."
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setUserInput("I need to focus on this final exam chapter. Please plug your headphones in, and I will be done by 5 PM.")} 
                      className="px-3 py-2 text-left rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 hover:border-gray-200 transition-all font-sans text-xs text-gray-600 cursor-pointer"
                    >
                      💡 <strong>Direct Request:</strong> "I need to focus on this final exam chapter. Please plug..."
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'result' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 rounded-2xl border bg-white space-y-6 text-center max-w-md mx-auto shadow-sm ${
              stealthActive ? "border-gray-200" : "border-orange-100/50"
            }`}
          >
            <CheckCircle2 size={44} className="text-green-500 mx-auto" />
            <div className="space-y-2">
              <h3 className={`text-lg font-bold font-serif ${stealthActive ? "font-sans text-gray-800" : "text-amber-950"}`}>
                Session Complete!
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans px-4">
                You tested your assertiveness boundary under pressure. Practicing these scenarios builds the automatic neural confidence you need when handling sudden domestic expectations.
              </p>
            </div>

            <div className="p-4 bg-green-50/50 border border-green-100/50 rounded-xl text-left text-xs leading-relaxed text-green-800 font-sans">
              <strong>Coach Review Advice:</strong> {feedback}
            </div>

            <button
              onClick={concludeSession}
              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all ${
                stealthActive ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-900 hover:bg-amber-950"
              }`}
            >
              Conclude & Lock Success Credit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
