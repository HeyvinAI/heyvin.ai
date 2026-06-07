import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, Heart, Shield, RefreshCw, MessageSquare, Clipboard, Check, HelpCircle, 
  Sparkles, Smile, ArrowRight, BookOpen, Volume2, UserCheck, Lock, Trash2
} from "lucide-react";
import { db } from "../lib/supabase";

interface TherapeuticCopingSuiteProps {
  userId: string;
  stealthActive: boolean;
}

interface ReframedThought {
  id: string;
  original: string;
  distortion: string;
  balanced: string;
  created_at: string;
}

export function TherapeuticCopingSuite({ userId, stealthActive }: TherapeuticCopingSuiteProps) {
  const [activeSubTab, setActiveSubTab] = useState<'reframer' | 'somatic' | 'boundaries'>('reframer');
  
  // CBT Reframer States
  const [originalThought, setOriginalThought] = useState("");
  const [selectedDistortion, setSelectedDistortion] = useState("All-or-Nothing Thinking");
  const [balancedThought, setBalancedThought] = useState("");
  const [wizardStep, setWizardStep] = useState(1);
  const [savedReframes, setSavedReframes] = useState<ReframedThought[]>([]);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // Somatic 5-4-3-2-1 States
  const [somaticCounts, setSomaticCounts] = useState({
    see: [] as string[],
    feel: [] as string[],
    hear: [] as string[],
    smell: [] as string[],
    goodThing: ""
  });
  const [groundingStep, setGroundingStep] = useState(1);
  const [seeInput, setSeeInput] = useState("");
  const [feelInput, setFeelInput] = useState("");
  const [hearInput, setHearInput] = useState("");
  const [smellInput, setSmellInput] = useState("");
  const [goodThingInput, setGoodThingInput] = useState("");

  useEffect(() => {
    loadSavedReframes();
  }, [userId]);

  const loadSavedReframes = () => {
    const data = db.get<ReframedThought>(userId, "cbt_reframes") || [];
    setSavedReframes(data);
  };

  const saveCbtReframe = () => {
    if (!originalThought.trim() || !balancedThought.trim()) return;

    const newReframe: ReframedThought = {
      id: Math.random().toString(36).substr(2, 9),
      original: originalThought,
      distortion: selectedDistortion,
      balanced: balancedThought,
      created_at: new Date().toISOString()
    };

    const current = db.get<ReframedThought>(userId, "cbt_reframes") || [];
    current.unshift(newReframe);
    db.save(userId, "cbt_reframes", current);
    
    // Save to circle activity anonymously to inspire sisters!
    const newAct = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      username: "Anonymous Sister",
      activity_type: "calm" as const,
      anonymized_label: "A sister completed a CBT cognitive reframing worksheet 🧠✨",
      created_at: new Date().toISOString()
    };
    const circleActs = db.get<any>(userId, "circle_activity") || [];
    circleActs.unshift(newAct);
    db.save(userId, "circle_activity", circleActs);

    setSavedReframes(current);
    
    // Reset Form
    setOriginalThought("");
    setBalancedThought("");
    setWizardStep(1);
  };

  const deleteReframe = (id: string) => {
    const current = db.get<ReframedThought>(userId, "cbt_reframes") || [];
    const updated = current.filter(r => r.id !== id);
    db.save(userId, "cbt_reframes", updated);
    setSavedReframes(updated);
  };

  // Pre-compiled respectful assertive scripts for domestic negotiation
  const boundaryScripts = [
    {
      id: "parents_study",
      title: stealthActive ? "Negotiating Academic Project Window with Elders" : "Asking Parents/In-laws for 2 Hours Quiet Time",
      desc: "Perfect when you need to study but are expected to handle domestic chore overlaps or social hosting duty continuously.",
      guideline: "Use an appreciative opening, state your clear goal, name a specific ending time, and offer a dedicated reciprocal chore slot.",
      script: `"Auntie / Mother, I really appreciate everything you do for the family and want to make sure the kitchen runs smoothly. Today, I have a critical academic target that determines my thesis readiness. I need to lock in deep concentration from 3:00 PM to 5:00 PM. I will keep my door closed and focus. To make sure we don't fall behind, I will fully complete the dishes and sweep the dining floor right after 5:00 PM. May I count on your support for these two quiet hours?"`,
      tone: "Highest respect, clear reciprocation, absolute clarity of boundaries."
    },
    {
      id: "partner_chores",
      title: stealthActive ? "Task Delegation Under Deadlines" : "Declining Minor Chore Demands from Partner during Exams",
      desc: "When a partner expects you to drop your books instantly for minor household tasks that could easily be delayed, shared, or automated.",
      guideline: "Express love, state the non-negotiability of study hours, request specific teamwork, and avoid apologizing unnecessarily.",
      script: `"I love you, and I want our home to feel warm. Right now, I'm at a critical point in my exam preparation and cannot drop my material without derailing my retention. My deep-study window runs until 8:00 PM. Let's tackle the dinner cooking together quickly after that, or alternate turns. Having these hours completely uninterrupted is what's keeping me on track."`,
      tone: "Cooperative but strong, firm timeline, equal partnership core."
    },
    {
      id: "guest_intrusions",
      title: stealthActive ? "Social Commitments Balancing Policy" : "Deflecting Uninvited Guests / Extended Family Pressures",
      desc: "For heavy domestic cultures where relatives drop by unexpectedly, expecting you to host, serve drinks, or chatter instead of pursuing your study track.",
      guideline: "Warm greeting, highlight your official academic tracking, make a polite but fast exit boundary.",
      script: `"Uncle, Auntie, it is so wonderful to see you! I wish I could sit and chat all afternoon, but I am in the middle of a timed online syllabus audit that is graded live. I must return to my desk immediately to avoid losing marks. Mother/Sister is in the living room and would love to serve you. Let's catch up for five minutes right before you leave!"`,
      tone: "Warm but briskly transient, using external authority (the system/grades) to create a shield."
    }
  ];

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptId(id);
    setTimeout(() => setCopiedScriptId(null), 3000);
  };

  // CBT Distortions guide
  const distortions = [
    {
      name: "All-or-Nothing Thinking",
      desc: "Viewing things in black-or-white categories. 'If my focus is broken by one chore, my whole day is ruined.'"
    },
    {
      name: "Should Statements",
      desc: "Holding yourself to rigid rules. 'I should be able to serve everyone perfectly and still get high grades without rest.'"
    },
    {
      name: "Catastrophizing",
      desc: "Exaggerating the worst outcome. 'Since they made so much noise today, I'm definitely going to fail my courses.'"
    },
    {
      name: "Emotional Reasoning",
      desc: "Thinking feelings represent reality. 'I feel so incredibly guilty for saying no, therefore I must be a bad daughter/partner.'"
    }
  ];

  // Somatic counting step functions
  const handleAddSomaticItem = (input: string, key: 'see' | 'feel' | 'hear' | 'smell') => {
    if (!input.trim()) return;
    setSomaticCounts(prev => ({
      ...prev,
      [key]: [...prev[key], input.trim()]
    }));
    
    // Clear the respective input
    if (key === 'see') setSeeInput("");
    if (key === 'feel') setFeelInput("");
    if (key === 'hear') setHearInput("");
    if (key === 'smell') setSmellInput("");
  };

  const handleCompleteSomaticStep = () => {
    setGroundingStep(prev => prev + 1);
  };

  const handleResetSomatic = () => {
    setSomaticCounts({ see: [], feel: [], hear: [], smell: [], goodThing: "" });
    setGroundingStep(1);
    setGoodThingInput("");
  };

  return (
    <div className="bg-white border border-[#EDE8E0] rounded-xl p-6 shadow-xs space-y-6">
      
      {/* Sub tabs inside calm therapeutic module */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div className="flex gap-1">
          <span className="p-1.5 bg-red-50 text-[#7C2D3E] rounded-md mr-1 flex items-center justify-center">
            <Heart size={14} fill="#7C2D3E" />
          </span>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#1A1414]">
              {stealthActive ? "Academic Stress Shield & Coping Tools" : "Sovereign Mind & Coping Suite"}
            </h3>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#7A6860]">
              {stealthActive ? "Cognitive Restorations & Boundary Scripts" : "Psychological Armour & CBT Worksheets"}
            </p>
          </div>
        </div>

        <div className="flex border border-gray-200 rounded-lg p-0.5 text-xs bg-[#FAF7F2]">
          <button
            onClick={() => setActiveSubTab('reframer')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              activeSubTab === 'reframer' ? "bg-white text-[#7C2D3E] shadow-xs" : "text-[#7A6860] hover:text-[#1A1414]"
            }`}
          >
            CBT Reframer
          </button>
          <button
            onClick={() => setActiveSubTab('somatic')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              activeSubTab === 'somatic' ? "bg-white text-[#7C2D3E] shadow-xs" : "text-[#7A6860] hover:text-[#1A1414]"
            }`}
          >
            Grounding (5-4-3-2-1)
          </button>
          <button
            onClick={() => setActiveSubTab('boundaries')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              activeSubTab === 'boundaries' ? "bg-white text-[#7C2D3E] shadow-xs" : "text-[#7A6860] hover:text-[#1A1414]"
            }`}
          >
            Boundary Scripts
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE COPING MODULE */}
      <AnimatePresence mode="wait">
        
        {/* CBT COGNITIVE REFRAMER */}
        {activeSubTab === 'reframer' && (
          <motion.div
            key="reframer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-[#FAF7F2] border border-[#EDE8E0] rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-[#7A6860]">
              <Brain size={18} className="text-[#7C2D3E] flex-shrink-0 mt-0.5" />
              <p>
                <strong>Cognitive Reframing</strong> is a scientifically proven CBT technique to challenge automatic negative thoughts born out of high domestic load or household stress. Identify the exact distortion pattern and formulate a resilient alternative.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Reframer interactive form / wizard */}
              <div className="border border-gray-150 rounded-xl p-5 bg-white space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#7C2D3E]">
                    Step {wizardStep} of 3
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Reframing Worksheet
                  </span>
                </div>

                {wizardStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="text-xs font-serif font-bold text-[#1A1414] block">
                        What automatic negative thought is holding you back right now?
                      </label>
                      <textarea
                        value={originalThought}
                        onChange={(e) => setOriginalThought(e.target.value)}
                        placeholder="e.g., I feel so guilty for not tidying up immediately when Auntie entered. I should have done it, now she'll think I'm a disrespectful daughter and tell everyone. I can never focus."
                        className="w-full p-3 rounded-lg border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#7C2D3E] min-h-[90px] leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-serif font-bold text-[#1A1414] block">
                        Identify the chief cognitive distortion:
                      </label>
                      <select
                        value={selectedDistortion}
                        onChange={(e) => setSelectedDistortion(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs text-gray-800 focus:outline-none bg-white font-medium"
                      >
                        {distortions.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                      <div className="p-2.5 bg-gray-50 rounded-lg text-[10.5px] text-gray-500 italic mt-1 leading-normal.">
                        💡 <strong>{selectedDistortion}:</strong> {distortions.find(d => d.name === selectedDistortion)?.desc}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!originalThought.trim()}
                      onClick={() => setWizardStep(2)}
                      className="w-full py-2.5 rounded-lg bg-[#7C2D3E] text-white hover:bg-[#60202e] disabled:bg-gray-200 disabled:text-gray-400 font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Challenge Thought →</span>
                    </button>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-2">
                      <span className="text-[11px] font-sans text-[#7A6860] uppercase tracking-wider block">Automatic Stress Thought Check</span>
                      <blockquote className="p-3 bg-red-50/50 border-l-2 border-red-400 text-xs text-gray-750 font-serif italic rounded-r-lg leading-relaxed">
                        "{originalThought}"
                      </blockquote>
                    </div>

                    <div className="space-y-1 bg-[#FAF7F2] p-3 rounded-lg border border-orange-100/50">
                      <h4 className="text-xs font-serif font-bold text-[#7C2D3E] flex items-center gap-1">
                        <HelpCircle size={12} /> Challenge this using rational audits:
                      </h4>
                      <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-1 mt-1.5 pl-1 leading-relaxed">
                        <li>Is this thought 100% true? Are there other explanations?</li>
                        <li>Can you control whether someone chooses to feel upset?</li>
                        <li>Is your academic future actually ruined by this single moment?</li>
                        <li>What would you tell a beloved sister experiencing this shame?</li>
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs cursor-pointer font-bold transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizardStep(3)}
                        className="flex-1 py-2 rounded-lg bg-[#7C2D3E] text-white hover:bg-[#60202e] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                      >
                        Balanced View →
                      </button>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="text-xs font-serif font-bold text-[#1A1414] block">
                        Formulate a resilient, balanced alternative thought:
                      </label>
                      <textarea
                        value={balancedThought}
                        onChange={(e) => setBalancedThought(e.target.value)}
                        placeholder="e.g., I'm allowed to guard my degree preparation time. It is natural to feel some automatic guilt under domestic pressure, but auntie is responsible for her own judgments. I am working hard on my goals, which is respectable. I will finish this chapter, and greet her warmly later. My progress is worth protecting."
                        className="w-full p-3 rounded-lg border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#7C2D3E] min-h-[110px] leading-relaxed"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWizardStep(2)}
                        className="flex-1 py-2 rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50 text-xs cursor-pointer font-bold transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={saveCbtReframe}
                        disabled={!balancedThought.trim()}
                        className="flex-1 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-gray-100 disabled:text-gray-400 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <UserCheck size={12} />
                        <span>Lock In Reframe</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Saved cognitive reframes */}
              <div className="flex flex-col h-full space-y-3">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7A6860] block">
                  Encrypted Reframing Shields ({savedReframes.length})
                </span>

                <div className="flex-1 overflow-y-auto max-h-[300px] border border-gray-100 rounded-xl bg-[#FAF7F2]/40 divide-y divide-gray-100">
                  {savedReframes.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400 font-sans flex flex-col items-center justify-center h-full space-y-1">
                      <Shield size={20} className="text-gray-300 stroke-1" />
                      <p className="font-bold text-gray-650 mt-1">Your psychological armor is empty</p>
                      <p className="max-w-[200px] leading-relaxed text-[11px] text-gray-400">Complete your first worksheet to generate cognitive shields.</p>
                    </div>
                  ) : (
                    savedReframes.map(ref => (
                      <div key={ref.id} className="p-4 bg-white/50 space-y-2 text-xs relative group hover:bg-white transition-all">
                        <button
                          onClick={() => deleteReframe(ref.id)}
                          className="absolute top-3 right-3 text-gray-300 hover:text-red-500 cursor-pointer p-1 rounded-md transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Reframe"
                        >
                          <Trash2 size={12} />
                        </button>

                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-red-750 bg-red-50 py-0.5 px-2 rounded-full uppercase border border-red-100/50 inline-block font-sans">
                            {ref.distortion} Challenge
                          </span>
                          <p className="text-gray-400 italic line-through leading-normal.">
                            "{ref.original}"
                          </p>
                        </div>

                        <div className="bg-emerald-50/20 border border-emerald-100/50 p-2 text-[11.5px] rounded-lg text-emerald-900 font-serif leading-relaxed flex gap-1.5">
                          <Sparkles size={12} className="text-emerald-600 flex-shrink-0 mt-0.5 animate-pulse" />
                          <p>{ref.balanced}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* SOMATIC 5-4-3-2-1 GROUNDING EXERCISE */}
        {activeSubTab === 'somatic' && (
          <motion.div
            key="somatic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-[#FAF7F2] border border-[#EDE8E0] rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-[#7A6860]">
              <Smile size={18} className="text-[#7C2D3E] flex-shrink-0 mt-0.5" />
              <p>
                When acute local disruption, high chore exhaustion, or environmental screaming triggers distress, use this interactive <strong>5-4-3-2-1 Somatic Grounding Tool</strong>. It anchors your neural center by engaging your physical surroundings, dampening psychological noise.
              </p>
            </div>

            <div className="max-w-2xl mx-auto border border-gray-150 rounded-xl bg-white p-6 space-y-6">
              
              {/* Stepper Display */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-serif font-bold text-[#1A1414]">Somatic Active Shield</span>
                <span className="text-[10px] font-mono bg-orange-50 text-[#7C2D3E] py-0.5 px-2 rounded-full uppercase font-bold tracking-widest">
                  Step {groundingStep} of 5
                </span>
              </div>

              {/* STEP 1: SEE */}
              {groundingStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-serif font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#7C2D3E] text-white flex items-center justify-center text-xs font-sans font-bold">5</span>
                    Acknowledge FIVE things you can SEE around you right now:
                  </h4>
                  <p className="text-xs text-[#7A6860] leading-relaxed">
                    Look closely. Find quiet colors, geometric structures, or static objects. Input them one by one to register them on your local spatial log.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. A drop of water on the cup, a shadow on the wall, blue book cover..."
                      value={seeInput}
                      onChange={(e) => setSeeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSomaticItem(seeInput, 'see')}
                      className="flex-1 p-2.5 rounded-lg border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddSomaticItem(seeInput, 'see')}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {somaticCounts.see.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-[11px] font-semibold py-1 px-2.5 rounded-full border border-gray-150 flex items-center gap-1 animate-scaleUp">
                        <Check size={10} className="text-emerald-600" /> {item}
                      </span>
                    ))}
                    {somaticCounts.see.length < 5 && (
                      <span className="text-[10px] text-gray-400 font-medium py-1 px-1">
                        Please list {5 - somaticCounts.see.length} more item(s)...
                      </span>
                    )}
                  </div>

                  <button
                    disabled={somaticCounts.see.length < 5}
                    onClick={handleCompleteSomaticStep}
                    className="w-full py-2.5 rounded-lg bg-[#7C2D3E] text-white hover:bg-[#60202e] disabled:bg-gray-100 disabled:text-gray-300 transition-all text-xs font-bold uppercase tracking-wider block text-center"
                  >
                    Confirm & Move Forward
                  </button>
                </div>
              )}

              {/* STEP 2: FEEL */}
              {groundingStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-serif font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#7C2D3E] text-white flex items-center justify-center text-xs font-sans font-bold">4</span>
                    Acknowledge FOUR things you can FEEL physically:
                  </h4>
                  <p className="text-xs text-[#7A6860] leading-relaxed">
                    Identify physical textures — the chair supporting your back, your feet resting firmly against the local floor board, the breeze against your cheeks, or the cool texture of your desk.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. My toes pressing against cold tiles, rough cotton sleeves, keyboard tactile keys..."
                      value={feelInput}
                      onChange={(e) => setFeelInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSomaticItem(feelInput, 'feel')}
                      className="flex-1 p-2.5 rounded-lg border border-gray-200 text-xs text-gray-800 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddSomaticItem(feelInput, 'feel')}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {somaticCounts.feel.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-[11px] font-semibold py-1 px-2.5 rounded-full border border-gray-150 flex items-center gap-1">
                        <Check size={10} className="text-emerald-600" /> {item}
                      </span>
                    ))}
                    {somaticCounts.feel.length < 4 && (
                      <span className="text-[10px] text-gray-400 font-medium py-1 px-1">
                        Please list {4 - somaticCounts.feel.length} more item(s)...
                      </span>
                    )}
                  </div>

                  <button
                    disabled={somaticCounts.feel.length < 4}
                    onClick={handleCompleteSomaticStep}
                    className="w-full py-2.5 rounded-lg bg-[#7C2D3E] text-white hover:bg-[#60202e] disabled:bg-gray-200 disabled:text-gray-300 transition-all text-xs font-bold uppercase tracking-wider block text-center"
                  >
                    Confirm & Move Forward
                  </button>
                </div>
              )}

              {/* STEP 3: HEAR */}
              {groundingStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-serif font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#7C2D3E] text-white flex items-center justify-center text-xs font-sans font-bold">3</span>
                    Acknowledge THREE things you can HEAR around you:
                  </h4>
                  <p className="text-xs text-[#7A6860] leading-relaxed">
                    Filter out local shouting, clutter, or panic. Do you hear birds, the buzz of a refrigerator, distant car engines, or your own slow and stable inhalation?
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Hum of the room fan, chirping from the courtyard window, car horn outside..."
                      value={hearInput}
                      onChange={(e) => setHearInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSomaticItem(hearInput, 'hear')}
                      className="flex-1 p-2.5 rounded-lg border border-gray-200 text-xs text-gray-800 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddSomaticItem(hearInput, 'hear')}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {somaticCounts.hear.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-[11px] font-semibold py-1 px-2.5 rounded-full border border-gray-150 flex items-center gap-1">
                        <Check size={10} className="text-emerald-600" /> {item}
                      </span>
                    ))}
                    {somaticCounts.hear.length < 3 && (
                      <span className="text-[10px] text-gray-400 font-medium py-1 px-1">
                        Please list {3 - somaticCounts.hear.length} more item(s)...
                      </span>
                    )}
                  </div>

                  <button
                    disabled={somaticCounts.hear.length < 3}
                    onClick={handleCompleteSomaticStep}
                    className="w-full py-2.5 rounded-lg bg-[#7C2D3E] text-white hover:bg-[#60202e] disabled:bg-gray-200 disabled:text-gray-300 transition-all text-xs font-bold uppercase tracking-wider block text-center"
                  >
                    Confirm & Move Forward
                  </button>
                </div>
              )}

              {/* STEP 4: SMELL */}
              {groundingStep === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-serif font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#7C2D3E] text-white flex items-center justify-center text-xs font-sans font-bold">2</span>
                    Acknowledge TWO things you can SMELL around you:
                  </h4>
                  <p className="text-xs text-[#7A6860] leading-relaxed">
                    Scent is a profound temporal anchor. Can you smell washing detergent, soap, coffee brewing, damp clay soil, or the wood of your desk?
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Scent of laundry soap, book paper smell, coffee grounds..."
                      value={smellInput}
                      onChange={(e) => setSmellInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSomaticItem(smellInput, 'smell')}
                      className="flex-1 p-2.5 rounded-lg border border-gray-200 text-xs text-gray-800 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddSomaticItem(smellInput, 'smell')}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {somaticCounts.smell.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-[11px] font-semibold py-1 px-2.5 rounded-full border border-gray-150 flex items-center gap-1">
                        <Check size={10} className="text-emerald-600" /> {item}
                      </span>
                    ))}
                    {somaticCounts.smell.length < 2 && (
                      <span className="text-[10px] text-gray-400 font-medium py-1 px-1">
                        Please list {2 - somaticCounts.smell.length} more item(s)...
                      </span>
                    )}
                  </div>

                  <button
                    disabled={somaticCounts.smell.length < 2}
                    onClick={handleCompleteSomaticStep}
                    className="w-full py-2.5 rounded-lg bg-[#7C2D3E] text-white hover:bg-[#60202e] disabled:bg-gray-100 disabled:text-gray-300 transition-all text-xs font-bold uppercase tracking-wider block text-center"
                  >
                    Confirm & Move Forward
                  </button>
                </div>
              )}

              {/* STEP 5: GOOD THING ABOUT YOURSELF */}
              {groundingStep === 5 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-sm font-serif font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#7C2D3E] text-white flex items-center justify-center text-xs font-sans font-bold">1</span>
                    State ONE admirable or proud thing about yourself:
                  </h4>
                  <p className="text-xs text-[#7A6860] leading-relaxed">
                    Say it and log it. You are charting a magnificent path towards autonomy, managing household heavy lifts while pursuing academic growth. You are resilient.
                  </p>

                  <input
                    type="text"
                    placeholder="e.g., I am exceptionally resilient. I am doing my absolute best to study under pressure, and my dream is worth working for."
                    value={goodThingInput}
                    onChange={(e) => setGoodThingInput(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#7C2D3E]"
                  />

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleResetSomatic}
                      className="flex-1 py-2 text-xs font-semibold border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      Reset Grounding
                    </button>
                    <button
                      disabled={!goodThingInput.trim()}
                      onClick={() => {
                        db.save(userId, "circle_activity", [
                          {
                            id: Math.random().toString(36).substr(2, 9),
                            user_id: userId,
                            username: "Anonymous Sister",
                            activity_type: "calm" as const,
                            anonymized_label: "A sister successfully centered her neural state using Somatic Grounding 🌸🧘",
                            created_at: new Date().toISOString()
                          },
                          ...(db.get<any>(userId, "circle_activity") || [])
                        ]);
                        setGroundingStep(6);
                      }}
                      className="flex-1 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-gray-100 disabled:text-gray-300 text-xs font-bold uppercase tracking-wider cursor-pointer font-semibold transition-all"
                    >
                      Complete & Anchor
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: COMPLETED EXERCISE COGNITIVE PEACE */}
              {groundingStep === 6 && (
                <div className="text-center p-6 space-y-4 animate-scaleUp">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100 animate-pulse">
                    <Heart size={28} fill="#10B981" />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-gray-800">You Are Centered & Guarded</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Take a deep, slow diaphragmatic breath. Your physical body is here — in this desk, working on your autonomy. The local screaming or pressure belongs outside your mental screen.
                  </p>
                  
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-gray-250 font-serif text-[13px] text-gray-700 italic leading-relaxed max-w-xs mx-auto">
                    "{goodThingInput}"
                  </div>

                  <button
                    onClick={handleResetSomatic}
                    className="px-6 py-2 rounded-lg bg-[#7C2D3E] hover:bg-[#60202e] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Restart Centering Flow
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}

        {/* ASSERTIVE BOUNDARY SCRIPTS */}
        {activeSubTab === 'boundaries' && (
          <motion.div
            key="boundaries"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-[#FAF7F2] border border-[#EDE8E0] rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-[#7A6860]">
              <Shield size={18} className="text-[#7C2D3E] flex-shrink-0 mt-0.5" />
              <p>
                Saying "No" to deep family obligations, uninvited relative demands, and partner expectancies can trigger extreme emotional guilt. Use these <strong>Appreciative Assertiveness Templates</strong> designed to guard study hours with utmost respect while offering transparent chore reciprocity.
              </p>
            </div>

            <div className="space-y-4">
              {boundaryScripts.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-[#EDE8E0] hover:border-gray-250 transition-all rounded-xl p-5 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#1A1414]">{item.title}</h4>
                      <p className="text-[11px] text-[#7A6860] mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.id, item.script)}
                      className={`text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all border ${
                        copiedScriptId === item.id
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-[#FAF7F2] hover:bg-[#EDE8E0] text-[#7C2D3E] border-orange-100"
                      }`}
                    >
                      {copiedScriptId === item.id ? (
                        <>
                          <Check size={10} /> Copied!
                        </>
                      ) : (
                        <>
                          <Clipboard size={10} /> Copy Script
                        </>
                      )}
                    </button>
                  </div>

                  {/* Highlighted Script Box */}
                  <div className="bg-orange-50/10 border-l-2 border-[#7C2D3E] p-3 rounded-r-lg font-serif italic text-xs leading-relaxed text-gray-850">
                    {item.script}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <span className="text-[9.5px] uppercase font-extrabold tracking-widest text-orange-950 font-sans block bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100/50">
                      Guideline: {item.guideline}
                    </span>
                    <span className="text-[9.5px] uppercase font-extrabold tracking-widest text-[#7A6860] font-sans block bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100/50">
                      Delivered tone: {item.tone}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
