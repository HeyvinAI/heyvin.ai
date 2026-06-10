import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Shield, Heart, HelpCircle, ChevronDown, ChevronUp, Check, 
  Settings, Zap, AlertTriangle, MessageCircle, Compass, Smile, Flame,
  Volume2, VolumeX, Play, Square, Award, AlertCircle, RefreshCw,
  Youtube, Video, ExternalLink, BookOpen
} from "lucide-react";

export interface LandingInteractiveShowcaseProps {
  onSignUpClick?: () => void;
}

export function LandingInteractiveShowcase({ onSignUpClick }: LandingInteractiveShowcaseProps) {
  // Simulator State
  const [choreHours, setChoreHours] = useState<number>(3);
  const [interruptionLevel, setInterruptionLevel] = useState<number>(3); // 1-5
  const [academicIntensity, setAcademicIntensity] = useState<'Light' | 'Moderate' | 'Extreme'>('Moderate');
  const [studySpot, setStudySpot] = useState<'Shared table' | 'Bedroom' | 'Rooftop/Library'>('Bedroom');

  // Interactive Shoutouts State
  const [shoutouts, setShoutouts] = useState([
    { id: 1, text: "Held my 2-hour morning block in Calabar today without apologizing! ✊", sister: "Calabar_Scholar", location: "Nigeria", supports: 15, supported: false },
    { id: 2, text: "To whoever is studying in Delhi tonight with noisy relatives outside: you are not alone, hold on. 💜", sister: "Delhi_Co-Pilot", location: "India", supports: 34, supported: false },
    { id: 3, text: "Code compiles successfully under candle light. Power cuts won't stop this degree. 🕯️", sister: "Lagos_Innovator", location: "Nigeria", supports: 29, supported: false },
    { id: 4, text: "Passed my tech screen! Reclaiming those kitchen hours was worth the friction! 😭✨", sister: "CDMX_Sovereign", location: "Mexico", supports: 41, supported: false }
  ]);
  const [newShoutText, setNewShoutText] = useState("");
  const [userLocation, setUserLocation] = useState("Nigeria");

  // Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Boundary role play states
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  const [selectedVideoGuide, setSelectedVideoGuide] = useState<number>(0);

  // Ambience Synth states
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [synthVolume, setSynthVolume] = useState<number>(40);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Clean up Audio Context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const scenarios = [
    {
      title: "The Sudden Morning Summons",
      situation: "You are deep in a 2-hour study session preparing for your chemistry final examination. A family member walks in and demands that you drop your papers right now to run quick food shopping errands down the street.",
      options: [
        {
          text: "Immediate Compliance: 'Okay, I will immediately power down my computer, fold my book notes, and go do it right now.'",
          rating: "High Interruption (15% Study momentum preserved)",
          feedback: "⚠️ Total momentum crash. This pre-programs relatives to suspect that your academic study time blocks are flexible and subject to spontaneous cancellation.",
          score: 15,
          color: "border-red-200 bg-red-50 text-red-900"
        },
        {
          text: "Aggressive Resistance: 'Can you please leave? I am trying to study and pass this class. Do it yourself!'",
          rating: "High Conflict Friction (50% Focus preserved)",
          feedback: "⚡ Emotional weight. While you saved physical time, you triggered heavy domestic static. The dynamic guilt, shouting, or friction will cloud your mind anyway.",
          score: 50,
          color: "border-amber-200 bg-amber-50 text-amber-900"
        },
        {
          text: "Heyvin Assertive Pacing: 'I have locked this study session for my chemistry course until 11:30 AM to pass tomorrow's test. I will start the errands at exactly 11:35 AM without fail.'",
          rating: "Ideal Sovereign Boundary (95% Focus preserved)",
          feedback: "🔑 Proportional accountability. You validate their chore request while setting a strict, non-negotiable temporal parameter. This is a secure boundary.",
          score: 95,
          color: "border-emerald-200 bg-emerald-50 text-emerald-900"
        }
      ]
    },
    {
      title: "The Evening Kitchen Clash",
      situation: "Dinner preparation occurs at 6:30 PM, but you have a live mock interview challenge with an international tech mentor from 6:00 PM to 7:00 PM.",
      options: [
        {
          text: "Cancel Mock Interview: Send an apology and pull out of the live technical session. Cooking takes priority to avoid friction.",
          rating: "Goal Compromised (10% Sovereignty preserved)",
          feedback: "❌ Extreme opportunity cost. Missing mock reviews delays your career readiness. Over time, constant avoidance fosters self-resentment.",
          score: 10,
          color: "border-red-200 bg-red-50 text-red-900"
        },
        {
          text: "Unannounced Lockdown: Say absolutely nothing, bolt your door, dim the light, and ignore dinner bells until your call concludes.",
          rating: "Volatile High Risk (35% Focus preserved)",
          feedback: "⚠️ Fragile environment. Loud knocking, family shouting, or parents cutting the router Wi-Fi can easily disrupt your call live stream.",
          score: 35,
          color: "border-amber-200 bg-amber-50 text-amber-900"
        },
        {
          text: "Proactive Schedule Swap: Speak with your sibling or partner at 3:00 PM: 'I have a job interview from 6 to 7. I will prep my half of the list at 4:15 PM so it is cooking ahead of schedule.'",
          rating: "Sovereign Masterpiece (100% Autonomy scored)",
          feedback: "🏆 High alignment. You anticipate the schedule clash early, satisfy your household contribution proactively, and guard your career advancement.",
          score: 100,
          color: "border-emerald-200 bg-emerald-50 text-emerald-900"
        }
      ]
    }
  ];

  // Web Audio Synth Generator for Focus Beats
  const playFocusSound = async (type: string) => {
    try {
      // Shutdown old sound
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        alert("Web Audio API is not supported in this environment standard.");
        return;
      }
      
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const gainNode = ctx.createGain();
      gainNodeRef.current = gainNode;

      // Filter high frequencies out slightly for a smooth dark drone sound, but allow mid frequencies to pass cleanly (raised cutoff from 600Hz to 1400Hz for laptop speaker fidelity)
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      if (type === "Peaceful Waves") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3 (Warm, highly audible base)
        
        // Harmonic overtone for smaller speakers (laptops/phones)
        const harmonic = ctx.createOscillator();
        harmonic.type = "sine";
        harmonic.frequency.setValueAtTime(440, ctx.currentTime); // A4 (Octave up)
        const harmonicGain = ctx.createGain();
        harmonicGain.gain.setValueAtTime(0.35, ctx.currentTime); // Elevated from 0.08 for laptop audio presence
        
        // Tremolo LFO to synthesize gentle rising and falling seawater tide patterns
        const tideLFO = ctx.createOscillator();
        tideLFO.frequency.setValueAtTime(0.18, ctx.currentTime); // ~5.5-second tide cycles
        const tideGain = ctx.createGain();
        tideGain.gain.setValueAtTime(0.06, ctx.currentTime);
        
        tideLFO.connect(tideGain);
        tideGain.connect(gainNode.gain); // Modulate volume dynamically
        
        osc.connect(filter);
        harmonic.connect(harmonicGain);
        harmonicGain.connect(filter);
        
        osc.start();
        harmonic.start();
        tideLFO.start();
      } else if (type === "Deep Focus Drone") {
        // Multi-frequency resonance layer (delivers rich depth on bass headphones AND clarity on laptops)
        const oscBase = ctx.createOscillator();
        oscBase.type = "triangle";
        oscBase.frequency.setValueAtTime(165, ctx.currentTime); // E3 (Warm mid base)
        
        const oscSub = ctx.createOscillator();
        oscSub.type = "sine";
        oscSub.frequency.setValueAtTime(82.5, ctx.currentTime); // E2 (Deep sub bass)
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.12, ctx.currentTime);
        
        const oscHarmonic = ctx.createOscillator();
        oscHarmonic.type = "sine";
        oscHarmonic.frequency.setValueAtTime(330, ctx.currentTime); // E4 (Octave shift up for mid register definition)
        const harmGain = ctx.createGain();
        harmGain.gain.setValueAtTime(0.30, ctx.currentTime); // Elevated from 0.06 for laptop audio presence
        
        const oscUpperHarmonic = ctx.createOscillator();
        oscUpperHarmonic.type = "sine";
        oscUpperHarmonic.frequency.setValueAtTime(495, ctx.currentTime); // B4 (Fifth harmony overlay)
        const upperHarmGain = ctx.createGain();
        upperHarmGain.gain.setValueAtTime(0.18, ctx.currentTime);
        
        oscBase.connect(filter);
        
        oscSub.connect(subGain);
        subGain.connect(filter);
        
        oscHarmonic.connect(harmGain);
        harmGain.connect(filter);

        oscUpperHarmonic.connect(upperHarmGain);
        upperHarmGain.connect(filter);
        
        oscBase.start();
        oscSub.start();
        oscHarmonic.start();
        oscUpperHarmonic.start();
      } else if (type === "Binaural Study Beat") {
        // True Stereo Binaural Beat shifted up slightly for speaker responsiveness
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        
        oscLeft.type = "sine";
        oscLeft.frequency.setValueAtTime(320, ctx.currentTime); // 320 Hz Left Channel
        
        oscRight.type = "sine";
        oscRight.frequency.setValueAtTime(327.5, ctx.currentTime); // 327.5 Hz (Theta wave brain entrainment)
        
        // Mid-tone background stabilizer pad for acoustic fullness
        const oscPad = ctx.createOscillator();
        oscPad.type = "triangle";
        oscPad.frequency.setValueAtTime(160, ctx.currentTime);
        const padGain = ctx.createGain();
        padGain.gain.setValueAtTime(0.18, ctx.currentTime);

        oscPad.connect(padGain);
        padGain.connect(filter);

        try {
          const merger = ctx.createChannelMerger(2);
          oscLeft.connect(merger, 0, 0);
          oscRight.connect(merger, 0, 1);
          merger.connect(filter);
        } catch (e) {
          // Graceful fallback for mono-merged output
          oscLeft.connect(filter);
          oscRight.connect(filter);
        }
        
        oscLeft.start();
        oscRight.start();
        oscPad.start();
      }

      // Master volume scale (boosted coefficient from 0.18 to 0.48 to make waves clearly audible)
      const volumeFloat = (synthVolume / 100) * 0.48;
      gainNode.gain.setValueAtTime(volumeFloat, ctx.currentTime);

      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Explicitly call resume to bypass modern browser autoplay restrictions
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      setSelectedSound(type);
    } catch (e) {
      console.error("Focus beat synthesis failed:", e);
    }
  };

  const stopFocusSound = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    gainNodeRef.current = null;
    setSelectedSound(null);
  };

  // Adjust volume dynamically while playing (smooth volume slider changes without jarring sound restarts)
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const volumeFloat = (synthVolume / 100) * 0.48;
      gainNodeRef.current.gain.setValueAtTime(volumeFloat, audioContextRef.current.currentTime);
    }
  }, [synthVolume]);

  // Simulator Math
  const calculateMetrics = () => {
    let basePotential = 12 - choreHours;
    
    const interruptionCosts = { 1: 0.5, 2: 1.0, 3: 2.0, 4: 3.5, 5: 5.0 };
    basePotential -= interruptionCosts[interruptionLevel as 1 | 2 | 3 | 4 | 5] || 2.0;

    const spotModifiers = { 'Shared table': -1.5, 'Bedroom': -0.5, 'Rooftop/Library': 1.0 };
    basePotential += spotModifiers[studySpot] || 0;

    const studyHoursReclaimed = Math.max(0.5, Math.min(10, Math.round(basePotential * 10) / 10));
    
    let baseStress = 15;
    baseStress += choreHours * 8;
    baseStress += interruptionLevel * 10;
    if (academicIntensity === 'Extreme') baseStress += 18;
    if (academicIntensity === 'Moderate') baseStress += 8;
    if (studySpot === 'Shared table') baseStress += 15;
    
    const stressRating = Math.min(98, Math.max(10, Math.round(baseStress)));

    let strategy = "";
    let colorTheme = "text-emerald-700 bg-emerald-50 border-emerald-100";
    if (stressRating > 75) {
      strategy = "Extreme Friction Sanctuary Protocol: Establish early morning slots (5am-7am) before chores wake. Shift difficult academic practice to local library sanctuaries. Use Heyvin’s CBT reframers immediately.";
      colorTheme = "text-red-800 bg-red-50 border-red-100";
    } else if (stressRating > 45) {
      strategy = "Assertive Pacing Program: Deploy Heyvin's Rehearsal Suite to practice calm boundary settings with your siblings. Create a rigid study lock calendar block of 2 hours daily.";
      colorTheme = "text-amber-800 bg-amber-50 border-amber-100";
    } else {
      strategy = "Sovereign Acceleration Course: You are in an optimal sweet spot. Compound your discipline by using the sovereign time log, tracking streaks, and starting a peer focus group circle.";
      colorTheme = "text-emerald-800 bg-emerald-50 border-emerald-100";
    }

    return { studyHoursReclaimed, stressRating, strategy, colorTheme };
  };

  const { studyHoursReclaimed, stressRating, strategy, colorTheme } = calculateMetrics();

  // Handle Shout Support Toggle
  const handleSupportShout = (id: number) => {
    setShoutouts(prev => prev.map(sh => {
      if (sh.id === id) {
        return {
          ...sh,
          supports: sh.supported ? sh.supports - 1 : sh.supports + 1,
          supported: !sh.supported
        };
      }
      return sh;
    }));
  };

  // Add Custom Shoutout
  const handleAddShout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShoutText.trim()) return;

    setShoutouts(prev => [
      {
        id: Date.now(),
        text: newShoutText.trim(),
        sister: `Sister_${Math.floor(Math.random() * 900 + 100)}`,
        location: userLocation,
        supports: 1,
        supported: true
      },
      ...prev
    ]);

    setNewShoutText("");
  };

  const faqs = [
    {
      q: "Is my personal diary history seen by anyone on my local hosting server?",
      a: "Absolutely not. Heyvin operates under a triple-sandboxed private localized schema. All your tasks, diaries, checks, and plans reside inside a secure localized client proxy storage on your physical device. No telemetry, database logging, or diagnostic tracking is shared."
    },
    {
      q: "How does the 'Stealth Cover Switch / StudySync' work under pressure?",
      a: "If uninvited house guests or family members suddenly walk in, triple-clicking the top Logo or hitting the quick hotkey instantly hides the entire tracker dashboard. It seamlessly renders an unassuming, static academic 'Syllabus and Course Material Portal' called StudySync. Your study hours and metrics remain completely invisible until you securely toggle it back."
    },
    {
      q: "Can I connect and share boundaries with other girls safely?",
      a: "Yes. Our Safe Circles interface allows you to connect peer study groups pseudonymously. You can send supportive study signals, coordinate work blocks, and trade daily focus victories without exposing your secure coordinates or raw email credentials."
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-16 py-12 text-left font-sans select-none">
      
      {/* 1. INTERACTIVE STUDY SWEET-SPOT & FRICTION SIMULATOR */}
      <section className="bg-white border border-[#EDE8E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C2D3E] bg-rose-50 px-2.5 py-1 rounded-full">
            Focus Capital Simulator
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1414] mt-3">
            Simulate Your Sovereign Focus Capital
          </h2>
          <p className="text-xs text-[#7A6860] mt-1 max-w-xl">
            Input your current domestic workloads and immediate study environments to dynamically gauge your daily focus potential and receive personal tactical blueprints.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Slider 1: Chore Hours */}
            <div className="space-y-2 bg-[#FAF7F2]/50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <Flame size={12} className="text-red-500" /> Daily chore/household commitment
                </label>
                <span className="text-xs font-bold text-[#7C2D3E]">{choreHours} hours / day</span>
              </div>
              <input 
                type="range"
                min="1"
                max="8"
                value={choreHours}
                onChange={(e) => setChoreHours(Number(e.target.value))}
                className="w-full accent-[#7C2D3E] cursor-ew-resize bg-orange-100"
              />
              <p className="text-[10px] text-gray-400">Cooking, water ferrying, looking after young relatives, and kitchen admin blocks.</p>
            </div>

            {/* Slider 2: Interruption Level */}
            <div className="space-y-2 bg-[#FAF7F2]/50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <MessageCircle size={12} className="text-amber-500" /> Unexpected domestic interruptions
                </label>
                <span className="text-xs font-bold text-amber-700">Level {interruptionLevel} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setInterruptionLevel(lvl)}
                    className={`py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      interruptionLevel === lvl
                        ? "bg-[#7C2D3E] text-white border-[#7C2D3E]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400">How often you get summoned away to handle quick unexpected requests while studying.</p>
            </div>

            {/* Selectors grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Study Spot */}
              <div className="space-y-1.5 p-4 bg-[#FAF7F2]/50 rounded-xl border border-gray-100">
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 block">Available Study Workspace</label>
                <div className="flex flex-col gap-1.5 pt-1">
                  {(['Shared table', 'Bedroom', 'Rooftop/Library'] as const).map(spot => (
                    <label key={spot} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="studyspot"
                        checked={studySpot === spot}
                        onChange={() => setStudySpot(spot)}
                        className="text-[#7C2D3E] focus:ring-0 cursor-pointer h-3.5 w-3.5"
                      />
                      <span>{spot}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Academic Load */}
              <div className="space-y-1.5 p-4 bg-[#FAF7F2]/50 rounded-xl border border-gray-100">
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 block">Academic Curriculum Density</label>
                <div className="grid grid-cols-3 gap-1 pt-1.5">
                  {(['Light', 'Moderate', 'Extreme'] as const).map((density) => (
                    <button
                      key={density}
                      type="button"
                      onClick={() => setAcademicIntensity(density)}
                      className={`py-1.5 px-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer text-center ${
                        academicIntensity === density
                          ? "bg-[#7C2D3E] text-white border-[#7C2D3E]"
                          : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-400 mt-2">Corresponds to immediate exam pressure cycles.</p>
              </div>
            </div>

          </div>

          {/* Real-time Dynamic Gauge Results Column */}
          <div className="lg:col-span-5 bg-[#FAF7F2] border border-[#EDE8E0] p-6 rounded-2xl flex flex-col justify-between h-full space-y-6">
            <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#7C2D3E]">Live Analysis Metrics</span>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-semibold text-gray-400 block font-mono">Focus Capital</span>
                <span className="text-2xl font-black text-[#7C2D3E] font-serif block">
                  {studyHoursReclaimed} hrs
                </span>
                <span className="text-[9.5px] font-semibold text-[#7A6860] leading-none block">study time left today</span>
              </div>

              <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-semibold text-gray-400 block font-mono">Cognitive Strain</span>
                <span className={`text-2xl font-black font-serif block ${stressRating > 65 ? "text-red-700" : stressRating > 45 ? "text-amber-600" : "text-emerald-700"}`}>
                  {stressRating}%
                </span>
                <span className="text-[9.5px] font-semibold text-[#7A6860] leading-none block">calculated fatigue index</span>
              </div>
            </div>

            {/* Dynamic Interactive Gauge Indicator */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>QUIET / OPTIONAL</span>
                <span>BURNOUT WARNING</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${Math.max(10, 100 - stressRating)}%` }} />
                <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${Math.min(90, stressRating)}%` }} />
              </div>
            </div>

            {/* Tactical Blueprint Suggestion */}
            <div className={`p-4 border rounded-xl space-y-3 transition-all leading-relaxed text-xs ${colorTheme} shadow-xs`}>
              <span className="font-serif font-bold text-[12px] flex items-center gap-1">
                <Zap size={12} />
                Sovereign Strategy Blueprint
              </span>
              <p className="font-medium text-gray-700 leading-normal">
                {strategy}
              </p>
              <button
                type="button"
                onClick={onSignUpClick}
                className="w-full mt-1.5 py-2 px-3 rounded-lg bg-[#7C2D3E] text-white hover:bg-[#60202e] text-[10px] uppercase font-extrabold tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Track Streak & Start Now ➔</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2. REAL-TIME INTERACTIVE BOUNDARY ROLE-PLAY SIMULATOR (NEW FEATURE FOR HIGH ENGAGEMENT) */}
      <section className="bg-[#FAF7F2] border border-[#EDE8E0] rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C2D3E] bg-rose-50 px-2.5 py-1 rounded-full">
            Interactive boundary workout
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1414] mt-3">
            Boundary Rehearsal Sanctuary
          </h2>
          <p className="text-xs text-[#7A6860] mt-1 max-w-xl">
            Sovereignty is not about aggressive rebellion; it is built on clear, polite, and absolute scheduling assertions. Try our conversational sparring gym below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Situation Box */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#EDE8E0] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-[10px] uppercase tracking-wide text-[#7C2D3E] font-bold">Scenario {activeScenario + 1} of 2</span>
              <button 
                type="button"
                onClick={() => {
                  setActiveScenario(prev => (prev === 0 ? 1 : 0));
                  setSelectedResponse(null);
                }}
                className="text-xs text-amber-800 hover:text-[#7C2D3E] font-medium font-serif flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} /> Switch Case
              </button>
            </div>
            
            <h3 className="text-sm font-serif font-bold text-gray-950">{scenarios[activeScenario].title}</h3>
            <p className="text-xs text-gray-700 leading-relaxed font-sans italic bg-[#FAF7F2] p-4 rounded-xl border border-dashed border-orange-100">
              "{scenarios[activeScenario].situation}"
            </p>
            
            <div className="space-y-2 pt-2">
              <span className="text-[9.5px] uppercase font-bold text-gray-400 block tracking-wide">Choose Your Reaction Response:</span>
              <div className="space-y-2">
                {scenarios[activeScenario].options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedResponse(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer flex items-start gap-2.5 ${
                      selectedResponse === idx 
                        ? "border-[#7C2D3E] bg-rose-50/50 font-semibold ring-2 ring-[#7C2D3E]/5" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold shrink-0 mt-0.5 ${
                      selectedResponse === idx ? "bg-[#7C2D3E] text-white border-[#7C2D3E]" : "border-gray-300 text-gray-500"
                    }`}>
                      {idx + 1}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Trainer Feedback Column */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#EDE8E0] min-h-[300px] flex flex-col justify-between">
            {selectedResponse === null ? (
              <div className="my-auto text-center space-y-4">
                <div className="w-12 h-12 bg-rose-50 text-[#7C2D3E] rounded-full flex items-center justify-center mx-auto">
                  <Compass size={24} className="animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-sm text-gray-950">Awaiting Your Assertive Step</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                    Select one of the three real-world responses on the left panel to trigger our sovereign behavioral evaluation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex flex-col justify-between h-full">
                
                {/* Score & Stamp Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-mono block">Tactical Calibration Code</span>
                    <span className="text-xs font-bold text-gray-900 leading-none">
                      {scenarios[activeScenario].options[selectedResponse].rating}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-mono block">Boundary Score</span>
                    <span className={`text-xl font-bold font-serif ${
                      scenarios[activeScenario].options[selectedResponse].score >= 80 
                        ? "text-emerald-700" 
                        : scenarios[activeScenario].options[selectedResponse].score >= 40 
                          ? "text-amber-600" 
                          : "text-red-700"
                    }`}>
                      {scenarios[activeScenario].options[selectedResponse].score} / 100
                    </span>
                  </div>
                </div>

                {/* Main feedback dialogue */}
                <div className={`p-4 rounded-xl border leading-relaxed text-xs space-y-3 ${scenarios[activeScenario].options[selectedResponse].color}`}>
                  <span className="font-bold font-serif text-[12px] flex items-center gap-1">
                    <Award size={13} />
                    Sanctuary Analysis Review
                  </span>
                  <p className="font-medium text-gray-800 leading-normal">
                    {scenarios[activeScenario].options[selectedResponse].feedback}
                  </p>
                </div>

                {/* Practical guidance tip */}
                <div className="p-4 bg-orange-50/50 rounded-xl space-y-2 border border-orange-100/30 text-xs text-amber-950">
                  <span className="font-semibold block flex items-center gap-1 text-[#7C2D3E]">
                    <AlertSquare /> Why this dynamic matters
                  </span>
                  <p className="leading-relaxed text-gray-600">
                    Heyvin helps you build a custom Boundary Log inside your dashboard. By tracking time block leakage, our tool charts where domestic friction repeatedly impacts your university studies.
                  </p>
                </div>

              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. DYNAMIC INTERACTIVE AUDIO FOCUS SYNTH GENERATOR */}
      <section className="bg-white border border-[#EDE8E0] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C2D3E] bg-rose-50 px-2.5 py-1 rounded-full">
              Sovereign Focus Waves
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1414] leading-tight">
              Acoustic Isolation Sound Generator
            </h2>
            <p className="text-xs text-[#7A6860] leading-relaxed">
              Family household ambient chatter and unexpected street noise can compromise study efficiency. Heyvin incorporates a local focus wave acoustic synthesizer. Synthesize customizable soft drones to envelop your immediate workspace directly.
            </p>
            <p className="text-[10.5px] font-mono text-gray-400">
              *Synthesized securely inside your hardware cache using the local browser Web Audio synthesizer node. No network downloads or background media trackers.
            </p>
          </div>

          {/* Synth Panel controller */}
          <div className="lg:col-span-5 bg-[#FAF7F2] border border-[#EDE8E0] p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase text-[#7C2D3E] tracking-wider">Acoustic Station Desk</span>
              {selectedSound ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 border border-emerald-100 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full shrink-0" />
                  Wave Synthesizer Active
                </span>
              ) : (
                <span className="text-[10px] font-bold text-gray-400">Station Idle</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Choose Synthesizer Beat:</label>
              <div className="space-y-1.5">
                {[
                  { name: "Peaceful Waves", desc: "Harmonic modulation emulating gentle water tides for creative writing" },
                  { name: "Deep Focus Drone", desc: "Rich brownian acoustic base blocks for math and complex algorithms" },
                  { name: "Binaural Study Beat", desc: "Theta binaural study notes to encourage fast information intake" }
                ].map((snd) => {
                  const isPlaying = selectedSound === snd.name;
                  return (
                    <button
                      key={snd.name}
                      type="button"
                      onClick={() => isPlaying ? stopFocusSound() : playFocusSound(snd.name)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isPlaying 
                          ? "border-[#7C2D3E] bg-white text-[#7C2D3E] font-bold shadow-xs" 
                          : "border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs block leading-tight">{snd.name}</span>
                        <span className="text-[9.5px] font-normal text-gray-400 block leading-none">{snd.desc}</span>
                      </div>
                      <div className="p-1 px-2.5 bg-[#FAF7F2] hover:bg-orange-50 border border-gray-150 rounded-lg text-[10px] flex items-center gap-1 text-gray-500">
                        {isPlaying ? <Square size={10} fill="#7C2D3E" className="text-[#7C2D3E]" /> : <Play size={10} fill="#6B7280" />}
                        <span>{isPlaying ? "Stop" : "Play"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider control volume */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                <span className="flex items-center gap-1"><Volume2 size={11} /> Wave Intensity Volume</span>
                <span>{synthVolume}%</span>
              </div>
              <input 
                type="range"
                min="5"
                max="100"
                value={synthVolume}
                onChange={(e) => setSynthVolume(Number(e.target.value))}
                className="w-full accent-[#7C2D3E] cursor-ew-resize bg-orange-100"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 4. SISTERHOOD SHOUTBOX (HIGHLY INTERACTIVE COMPONENT) */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column description */}
        <div className="md:col-span-5 space-y-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C2D3E] bg-rose-50 px-2.5 py-1 rounded-full">
            Sisterhood Network
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1414] leading-snug">
            Sisterhood Support Shoutbox
          </h2>
          <p className="text-xs text-[#7A6860] leading-relaxed">
            A pseudonymous, real-time supportive message board where girls can share victories, express technical solidarity, or leave brief daily reminders of boundaries.
          </p>
          <div className="p-4 bg-[#FAF7F2] border border-[#EDE8E0] rounded-xl text-xs text-[#7A6860] leading-normal font-serif italic">
            "We build the software that grants us wings, but we guard our clocks collectively."
          </div>
        </div>

        {/* Right column interactive list & submit */}
        <div className="md:col-span-7 bg-white border border-[#EDE8E0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          
          <form onSubmit={handleAddShout} className="flex gap-2">
            <div className="flex-1 space-y-1">
              <input
                type="text"
                required
                maxLength={80}
                placeholder="Share a mini-victory or helpful thought (e.g. studied 3hrs)..."
                value={newShoutText}
                onChange={(e) => setNewShoutText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <select
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="px-2 border border-gray-200 rounded-xl text-xs text-gray-700 bg-white focus:outline-none"
            >
              <option value="Nigeria">Nigeria</option>
              <option value="India">India</option>
              <option value="Mexico">Mexico</option>
              <option value="Other">Other</option>
            </select>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#7C2D3E] cursor-pointer hover:bg-[#60202e] transition-all hover:shadow-xs shrink-0"
            >
              Post
            </button>
          </form>

          {/* Shoutouts Stream */}
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {shoutouts.map((sh) => (
              <div 
                key={sh.id}
                className="p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-all flex items-start justify-between bg-white gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <p className="text-xs text-gray-800 font-sans leading-relaxed">
                    "{sh.text}"
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="font-bold text-[#7C2D3E]">{sh.sister}</span>
                    <span>·</span>
                    <span className="uppercase font-semibold text-[8.5px]">{sh.location}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSupportShout(sh.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                    sh.supported 
                      ? "bg-rose-50 text-rose-700 border-rose-100 font-extrabold" 
                      : "bg-white text-gray-400 border-gray-150 hover:bg-rose-50 hover:text-[#7C2D3E] hover:border-rose-100"
                  }`}
                >
                  <Heart size={9} fill={sh.supported ? "#B91C1C" : "none"} className={sh.supported ? "scale-110" : ""} />
                  <span>{sh.supports} Support</span>
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. SOVEREIGN VIDEO MASTERCLASSES & STUDY GUIDES (YOUTUBE INTEGRATION) */}
      <section className="space-y-6">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 bg-red-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Youtube size={11} className="text-red-600" /> Heyvin Video Masterclasses
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-amber-950 uppercase tracking-tight">
            Sovereign Study Handbook & Video Guides
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6860] max-w-xl mx-auto leading-relaxed">
            Short, highly specialized tactical lessons to help you master time-blocking, configure stealth security codes, and protect your studies against unexpected interruptions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          
          {/* Video List Column */}
          <div className="lg:col-span-5 space-y-3.5">
            {[
              {
                id: 0,
                title: "Tactical Time-Blocking & Guarding Study Slots",
                duration: "12:15 Min",
                category: "Time Sovereignty",
                desc: "Map out non-negotiable morning windows before household chores summon you.",
                youtubeUrl: "https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS"
              },
              {
                id: 1,
                title: "StudySync Config: Active Double-Stealth Interface",
                duration: "08:45 Min",
                category: "Privacy & Protection",
                desc: "Configure the active syllabus cover switch to look like a standard university portal.",
                youtubeUrl: "https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS"
              },
              {
                id: 2,
                title: "Domestic Boundary Diplomacy & Home Pacing Rules",
                duration: "15:20 Min",
                category: "Friction Auditing",
                desc: "Unpack script formulas to gracefully negotiate quiet focus blocks inside crowded homes.",
                youtubeUrl: "https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS"
              }
            ].map((video) => {
              const isActive = selectedVideoGuide === video.id;
              return (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideoGuide(video.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isActive 
                      ? "border-[#7C2D3E] bg-[#FAF7F2] shadow-sm ring-1 ring-[#7C2D3E]/20" 
                      : "border-gray-205 bg-white hover:border-gray-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] font-bold font-mono text-gray-400 uppercase tracking-widest mb-1.5">
                    <span className={isActive ? "text-[#7C2D3E]" : "text-gray-400"}>{video.category}</span>
                    <span className="bg-orange-50 text-[#7C2D3E] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Play size={8} fill="#7C2D3E" className="text-[#7C2D3E]" /> {video.duration}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-gray-950 mb-1 leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-[11px] text-[#7A6860] leading-normal font-sans">
                    {video.desc}
                  </p>
                  <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-semibold text-[#7C2D3E]">
                    <span>View Lesson Guide Summary</span>
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline text-red-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Youtube size={11} /> Watch on YouTube
                    </a>
                  </div>
                </div>
              );
            })}

            {/* Quick Channel Link Button */}
            <a
              href="https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-200 bg-red-50/30 hover:bg-red-50 text-xs text-red-700 font-bold font-sans transition-all text-center cursor-pointer"
            >
              <Youtube size={14} className="text-red-600 animate-pulse" />
              <span>Explore Heyvin Official Video Channel</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Interactive Lesson Video Player Mockup / Content Panel */}
          <div className="lg:col-span-7 bg-white border border-[#EDE8E0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            {(() => {
              const activeVideo = [
                {
                  id: 0,
                  title: "Tactical Time-Blocking & Guarding Study Slots",
                  duration: "12:15 Min",
                  category: "Time Sovereignty",
                  summary: "In this session, we map out non-negotiable morning study windows before your household summons you for spontaneous chores or tasks. Unpack real steps to block 2 uninterrupted hours every morning to advance your technology courses.",
                  youtubeUrl: "https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS",
                  bgGradient: "from-amber-950 to-[#60202e]",
                  steps: [
                    "Perform a daily chore load audit to establish a predictable baseline schedule.",
                    "Define a strict study window (e.g., 8:00 AM - 10:00 AM) and pre-empt relatives before starting.",
                    "Lock focus waves internally to block street noise and background conversations."
                  ],
                  blueprint: "Boundary Script: 'I have dedicated this 2-hour window specifically for my mock exams. I will cheerfully handle all shopping chores at exactly 10:15 AM without fail.'"
                },
                {
                  id: 1,
                  title: "StudySync Config: Active Double-Stealth Interface",
                  duration: "08:45 Min",
                  category: "Privacy & Protection",
                  summary: "Suddenly interrupted? Learn how to configure active academic syllabus covers inside your Heyvin personal hub. Hitting the discrete stealth switch instantly swaps your stats with a boring course table.",
                  youtubeUrl: "https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS",
                  bgGradient: "from-[#60202e] to-[#7C2D3E]",
                  steps: [
                    "Access your workspace settings and select generic course templates (Chemistry, Commerce).",
                    "Configure your instant stealth key mapping or triple-click the top header logo.",
                    "Practice smooth transitions to shield your professional career preparation pages with confidence."
                  ],
                  blueprint: "Tactical Check: 'Practice hitting the stealth-mode toggle when guests arrive. It loads a fully-interactive syllabus structure with simulated calendars.'"
                },
                {
                  id: 2,
                  title: "Domestic Boundary Diplomacy & Home Pacing Rules",
                  duration: "15:20 Min",
                  category: "Friction Auditing",
                  summary: "A masterclass on high-agency diplomacy tricks. How to negotiate healthy temporal space with your parents, siblings, or in-laws in Lagos, Delhi, or CDMX without initiating domestic friction.",
                  youtubeUrl: "https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS",
                  bgGradient: "from-[#1A1414] to-amber-950",
                  steps: [
                    "Proactively complete default kitchen or home tasks ahead of time to maintain zero grounds of complaint.",
                    "Maintain supreme professional poise regarding your tech mock reviews and interviews.",
                    "Audit your household boundary leaks within the local metrics database to log progress patterns."
                  ],
                  blueprint: "Diplomatic Blueprint: 'Work with your sibling or peer early. Trade cooking schedules to safeguard live webinar slots. Clear communication is the currency of autonomy.'"
                }
              ][selectedVideoGuide];

              return (
                <div className="space-y-4 animate-fadeIn font-sans">
                  {/* Visual Video Thumbnail Playback Area */}
                  <div className={`w-full relative h-48 sm:h-56 rounded-2xl bg-gradient-to-br ${activeVideo.bgGradient} flex flex-col justify-between p-5 text-white overflow-hidden shadow-xs border border-amber-900/10`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-6xl select-none font-serif leading-none block">
                      HEYVIN
                    </div>
                    <span className="p-1.5 px-3 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-bold tracking-widest uppercase self-start border border-white/5 font-mono">
                      {activeVideo.category} Masterclass
                    </span>

                    <a
                      href={activeVideo.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                    >
                      <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center border-2 border-white/90 shadow-lg group-hover:scale-110 transition-transform duration-350">
                        <Play size={20} fill="white" strokeWidth={0} className="ml-1 text-white" />
                      </div>
                    </a>

                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-white text-xs block font-mono">Active Lesson Video Overview</span>
                        <h4 className="text-sm font-serif font-bold text-orange-50 leading-tight">
                          {activeVideo.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-rose-200 block font-mono">
                        DURATION: {activeVideo.duration}
                      </span>
                    </div>
                  </div>

                  {/* Summary Notes */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-amber-950 font-serif flex items-center gap-1.5">
                      <BookOpen size={13} className="text-[#7C2D3E]" /> Lesson Lesson Target Summary
                    </span>
                    <p className="text-[#7A6860] leading-relaxed font-sans font-normal">
                      {activeVideo.summary}
                    </p>
                  </div>

                  {/* Operational Steps */}
                  <div className="space-y-2 bg-[#FAF7F2] p-4 rounded-xl border border-orange-100/30">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#7C2D3E] block font-mono">Core Execution Protocol Code:</span>
                    <ul className="space-y-1.5">
                      {activeVideo.steps.map((step, index) => (
                        <li key={index} className="flex gap-2 text-xs font-medium text-gray-700">
                          <span className="w-4 h-4 bg-white border border-orange-150 rounded-full flex items-center justify-center text-[9px] font-bold font-mono text-[#7C2D3E] shrink-0">{index + 1}</span>
                          <span className="flex-1 font-sans">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Blueprint Script Box */}
                  <div className="bg-[#FAF7F2]/40 border border-orange-50 p-3.5 rounded-xl text-[11px] leading-relaxed font-serif text-amber-950 italic">
                    "{activeVideo.blueprint}"
                  </div>

                  {/* CTA To YouTube */}
                  <div className="pt-2 text-center">
                    <a
                      href={activeVideo.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-red-600 font-bold hover:underline"
                    >
                      <Youtube size={14} /> Practical application session is on YouTube. Follow video description details →
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </section>

      {/* THE TEAM SECTION (AS ATTACHED IN THE USER'S DESIGN IMAGE) */}
      <section className="bg-[#0b1329] text-white rounded-3xl p-6 sm:p-8 space-y-8 border border-cyan-500/10 shadow-2xl relative overflow-hidden font-sans">
        {/* Decorative corner ambient lights */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 text-center md:text-left relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-cyan-400 font-mono flex items-center justify-center md:justify-start gap-2.5">
            THE TEAM
          </h2>
          <p className="text-xs sm:text-sm text-cyan-200/80 font-mono italic leading-relaxed">
            Two founders. Every skill the product needs. One mission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Card 1: Ozioma */}
          <div className="bg-[#070e20] rounded-2xl border-t-2 border-cyan-400 border border-cyan-500/5 p-6 space-y-6 flex flex-col justify-between hover:border-cyan-400/40 transition-all duration-300 shadow-xl group">
            <div className="space-y-6 text-center">
              {/* Circular initial */}
              <div className="mx-auto w-20 h-20 rounded-full border-2 border-cyan-400/50 flex items-center justify-center bg-cyan-950/20 shadow-[0_0_20px_rgba(34,211,238,0.05)] group-hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-bold font-mono text-cyan-400 leading-none">O</span>
              </div>

              {/* Bio details */}
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-serif text-white tracking-wide">Ozioma</h3>
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
                  CEO & Co-Founder
                </p>
                <p className="text-[11px] text-gray-400 italic">
                  Tech, AI & Data Systems Lead
                </p>
              </div>

              {/* Custom badge tags grid */}
              <div className="grid grid-cols-2 gap-2 text-[9.5px] font-semibold font-mono tracking-wide">
                {[
                  "AI Architecture",
                  "Data Systems",
                  "Business Strategy",
                  "Emerging Markets",
                ].map((tag, i) => (
                  <span 
                    key={i} 
                    className="p-2 rounded-lg bg-[#0c142c] border border-cyan-400/10 text-cyan-300 text-center hover:bg-[#101a38] hover:border-cyan-400/25 transition-all text-[9.5px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Impact phrase line */}
            <p className="text-[11px] text-gray-400 text-center font-mono border-t border-cyan-500/5 pt-4 mt-2">
              The technical and strategic backbone of Heyvin AI
            </p>
          </div>

          {/* Card 2: Dominion */}
          <div className="bg-[#070e20] rounded-2xl border-t-2 border-emerald-400 border border-emerald-500/5 p-6 space-y-6 flex flex-col justify-between hover:border-emerald-400/40 transition-all duration-300 shadow-xl group">
            <div className="space-y-6 text-center">
              {/* Circular initial */}
              <div className="mx-auto w-20 h-20 rounded-full border-2 border-emerald-400/50 flex items-center justify-center bg-emerald-950/20 shadow-[0_0_20px_rgba(52,211,153,0.05)] group-hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-bold font-mono text-emerald-400 leading-none">D</span>
              </div>

              {/* Bio details */}
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-serif text-white tracking-wide">Dominion</h3>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                  CPO & Co-Founder
                </p>
                <p className="text-[11px] text-gray-400 italic">
                  Product Design & User Psychology Lead
                </p>
              </div>

              {/* Custom badge tags grid */}
              <div className="grid grid-cols-2 gap-2 text-[9.5px] font-semibold font-mono tracking-wide">
                {[
                  "UX Design",
                  "User Psychology",
                  "Stealth Interface",
                  "Cultural Design",
                ].map((tag, i) => (
                  <span 
                    key={i} 
                    className="p-2 rounded-lg bg-[#0c142c] border border-emerald-400/10 text-emerald-300 text-center hover:bg-[#101a38] hover:border-emerald-400/25 transition-all text-[9.5px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Impact phrase line */}
            <p className="text-[11px] text-gray-400 text-center font-mono border-t border-cyan-500/5 pt-4 mt-2">
              The voice and guardian of the user inside every product decision
            </p>
          </div>
        </div>
      </section>

      {/* 6. HARD TRUST VERIFICATION CHECKLIST (MANDATORY SAFE SANCTUARY AUDIT) */}
      <section className="bg-[#FAF7F2] border border-[#EDE8E0] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-1.5 text-xs text-[#7C2D3E] font-bold font-serif italic">
            <Shield size={14} /> Local Isolation Audit
          </div>
          <h3 className="text-xl font-serif font-black text-gray-900 leading-tight">
            Absolutely Private. Locally Sovereign.
          </h3>
          <p className="text-xs text-[#7A6860] leading-relaxed max-w-xl">
            We operate a zero-telemetry technical policy. No information about your career planning, check-ins, diary records, or homework logs ever bypasses your browser cache or physical device workspace.
          </p>
        </div>

        <div className="space-y-2 bg-white/70 border border-orange-100/35 p-4 rounded-xl">
          {[
            "Fully localized SQLite & storage caching",
            "Discreet double stealth-switch interface",
            "Encrypted mock network packet isolation",
            "Zero browser history tracking payloads"
          ].map((check, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gray-700 font-sans">
              <span className="p-0.5 bg-emerald-50 text-emerald-800 rounded-md">
                <Check size={11} strokeWidth={3} />
              </span>
              <span>{check}</span>
            </div>
          ))}
        </div>

      </section>

      {/* 6. FREQUENTLY ASKED TRUST ACCORDIONS */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1414] text-center">
          Trust & Sovereignty Clarifications
        </h2>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-[#EDE8E0] rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-serif font-bold text-sm sm:text-base text-gray-950 hover:bg-[#FAF7F2]/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-[#7C2D3E]">
                    <HelpCircle size={15} />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={14} className="text-[#7C2D3E]" /> : <ChevronDown size={14} className="text-gray-400" />}
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 border-t border-gray-50 text-xs sm:text-sm text-[#7A6860] leading-relaxed font-sans bg-[#FAF7F2]/20 animate-fadeIn font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL HIGH-CONVERSION CTA PROMOTION */}
      <section className="bg-gradient-to-br from-[#40121a] via-[#1b080b] to-[#25090f] text-white rounded-3xl p-8 sm:p-10 text-center space-y-6 relative overflow-hidden shadow-2xl mt-8 border border-red-950">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#7C2D3E]/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 bg-amber-950/70 border border-amber-500/20 px-3.5 py-1 rounded-full">
            100% Free & Device-Isolated
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-amber-50 leading-tight">
            Ready to claim complete study authority?
          </h2>
          <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed max-w-lg mx-auto font-sans font-medium">
            Create your local pseudonym profile under 30 seconds. Sync with secure Google OAuth calendars without exposing a single pixel of your personal life.
          </p>
        </div>

        <div className="pt-2 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onSignUpClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider bg-white text-[#7C2D3E] hover:bg-rose-50 transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Create Your Safe Space Instantly</span>
            <Sparkles size={14} className="text-[#7C2D3E]" />
          </button>
          
          <button
            type="button"
            onClick={onSignUpClick}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider bg-[#541a24] hover:bg-[#46141c] border border-white/10 text-orange-100 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <span>Sign-On with Google</span>
          </button>
        </div>
        
        <p className="text-[10px] text-rose-300 font-mono tracking-wide relative z-10 pt-2">
          🛡️ No credit cards. No server-side file storing. 100% confidentiality guaranteed.
        </p>
      </section>

    </div>
  );
}

// Inline fallback icon helper for custom builds
function AlertSquare() {
  return (
    <span className="inline-flex items-center justify-center p-0.5 bg-[#7C2D3E] text-white rounded font-mono text-[9px] font-black w-3.5 h-3.5">
      !
    </span>
  );
}
