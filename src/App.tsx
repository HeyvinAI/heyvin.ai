import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun, Moon, Shield, Lock, Unlock, Crown, Users, FileText, Sparkles, Brain, Compass, 
  LogOut, ArrowRight, Check, Plus, AlertCircle, RefreshCw, Smartphone, TrendingUp, Info, 
  Heart, Calendar, Menu, X, HelpCircle, Eye, ChevronLeft, Target, Volume2, User, Database,
  Youtube, BookText, Map as MapIcon, Settings
} from "lucide-react";
import { UserProfile, CheckIn, Task, SovereigntyScore, WeeklyReport, RehearseSession } from "./types";
import { db, getActiveUser, seedUserData } from "./lib/supabase";
import { getAffirmation } from "./data/affirmations";

// Modular Views
import SovereigntyScoreView from "./components/SovereigntyScoreView";
import WeeklyReportView from "./components/WeeklyReportView";
import SafeCirclesView from "./components/SafeCirclesView";
import PatternPredictionView from "./components/PatternPredictionView";
import RehearsePlayground from "./components/RehearsePlayground";
import { HeyvinLogo } from "./components/HeyvinLogo";

// New Redesign Features
import { FrictionHeatmapView } from "./components/FrictionHeatmapView";
import { HeyvinJournalView } from "./components/HeyvinJournalView";
import { MorningBriefingCard } from "./components/MorningBriefingCard";
import { FocusLockView } from "./components/FocusLockView";
import { TherapeuticCopingSuite } from "./components/TherapeuticCopingSuite";
import { SovereignSettingsView } from "./components/SovereignSettingsView";
import { SovereignChroniclesFeed } from "./components/SovereignChroniclesFeed";
import { LandingInteractiveShowcase } from "./components/LandingInteractiveShowcase";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("today");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Theme State: 'haven' (light) or 'dark' (high-contrast late-night studying)
  const [theme, setTheme] = useState<'haven' | 'dark'>(() => {
    return (localStorage.getItem("heyvin_theme") as 'haven' | 'dark') || "haven";
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'haven' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem("heyvin_theme", theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Stealth Mode State
  const [stealthActive, setStealthActive] = useState<boolean>(() => {
    return localStorage.getItem("stealth_active") === "true";
  });

  // Guest Landing vs Register/Onboarding Navigation Screen State
  const [guestView, setGuestView] = useState<'landing' | 'auth'>('landing');

  // Onboarding parameters
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupLocation, setSignupLocation] = useState<'Lagos' | 'Delhi' | 'Mexico' | 'Other'>("Lagos");
  const [signupBasedIn, setSignupBasedIn] = useState<'Nigeria' | 'India' | 'Mexico' | 'Other'>("Nigeria");
  const [signupHomeSituation, setSignupHomeSituation] = useState<'Living with parents' | 'Partner' | 'In-laws' | 'Siblings' | 'Other'>("Living with parents");
  const [signupPrimaryGoal, setSignupPrimaryGoal] = useState<'University degree' | 'Career growth' | 'Starting a business'>("University degree");

  // Google OAuth credentials state
  const [googleAuthUser, setGoogleAuthUser] = useState<{ email: string; name: string } | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [showOAuthHelp, setShowOAuthHelp] = useState(false);
  const [signUpStep, setSignUpStep] = useState<number>(1);

  // Logging Forms
  const [stressLevel, setStressLevel] = useState<number>(40);
  const [frictionSource, setFrictionSource] = useState("Heavy family chores");
  const [hoursReclaimed, setHoursReclaimed] = useState<number>(2.0);
  const [journalNotes, setJournalNotes] = useState("");

  // Calm Breath Timer States
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathTimer, setBreathTimer] = useState(0);

  // Tasks local tracking
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<'Academics' | 'Career Prep' | 'Personal Boundaries' | 'Life Admin'>("Academics");

  // Affirmations overlay states
  const [timedAffirmation, setTimedAffirmation] = useState<string | null>(null);
  const [showHighStressAlert, setShowHighStressAlert] = useState<string | null>(null);
  const [todayAffirmationDismissed, setTodayAffirmationDismissed] = useState<boolean>(() => {
    return localStorage.getItem("dismissed_today_aff") === new Date().toDateString();
  });

  // Logo triple-tap gesture tracker
  const [logoClicks, setLogoClicks] = useState(0);
  const logoClickTimeout = useRef<any>(null);

  // Load user session on start
  useEffect(() => {
    const sessionUser = getActiveUser();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      loadUserData(sessionUser.uid);
    }
  }, []);

  // Update browser tab page title to reflect stealth state instantly
  useEffect(() => {
    document.title = stealthActive ? "StudySync - Student Syllabus Portal" : "Heyvin - Secure Sovereignty Monitor";
  }, [stealthActive]);

  // Sync state for local checklists
  const loadUserData = (uid: string) => {
    setTasks(db.get<Task>(uid, "tasks"));
  };

  // Listen to inner storage update alerts for live updates
  useEffect(() => {
    const handler = () => {
      if (currentUser) {
        setTasks(db.get<Task>(currentUser.uid, "tasks"));
      }
    };
    window.addEventListener("heyvin_db_update", handler);
    return () => window.removeEventListener("heyvin_db_update", handler);
  }, [currentUser]);

  // Listen for Google OAuth callback success payload
  useEffect(() => {
    // 1. Direct query parameter check for secure redirect callback fallback
    const params = new URLSearchParams(window.location.search);
    const oauthEmail = params.get('oauth_email');
    const oauthName = params.get('oauth_name');
    if (oauthEmail && oauthName) {
      setSignupName(oauthName);
      setSignupEmail(oauthEmail);
      setGoogleAuthUser({ email: oauthEmail, name: oauthName });
      triggerSuccessToast(`Google credentials connected: ${oauthEmail} 🛡️`);
      setSignUpStep(2);
      // Clean up URL parameters to keep address bar pristine
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Message Event listener for popup window fallback
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      const isTrusted = 
        origin === window.location.origin || 
        origin.endsWith('.run.app') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') || 
        origin.includes('vercel.app');
        
      if (!isTrusted) {
        return;
      }
      
      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS' && event.data?.user) {
        setOauthLoading(false);
        const { name, email } = event.data.user;
        
        // Let's set prefilled signup details to save effort!
        setSignupName(name);
        setSignupEmail(email);
        setGoogleAuthUser({ email, name });
        triggerSuccessToast(`Google credentials connected: ${email} 🛡️`);
        setSignUpStep(2);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    try {
      const originParam = encodeURIComponent(window.location.origin);
      const res = await fetch(`/api/auth/google/url?origin=${originParam}`);
      if (!res.ok) throw new Error("Could not construct OAuth authorization url");
      const data = await res.json();
      
      // If we are in sandbox mode, skip popups entirely for 100% reliable instant walkthroughs!
      if (data.isSandbox || (data.url && data.url.includes("sandbox_code"))) {
        setOauthLoading(false);
        setSignupName("Sovereign Sister");
        setSignupEmail("sister.sovereign@gmail.com");
        setGoogleAuthUser({ email: "sister.sovereign@gmail.com", name: "Sovereign Sister" });
        triggerSuccessToast("Sandbox Mode Connected: sister.sovereign@gmail.com 🛡️");
        setSignUpStep(2);
        return;
      }

      let targetUrl = data.url;
      if (targetUrl.startsWith("/")) {
        targetUrl = `${window.location.origin}${targetUrl}`;
      }

      const authWindow = window.open(
        targetUrl,
        "heyvin_google_oauth_popup",
        "width=520,height=650"
      );

      if (!authWindow) {
        // If popup is blocked by browser, redirect inside the active page!
        setOauthLoading(true);
        triggerSuccessToast("Opening secure Google auth window...");
        window.location.href = targetUrl;
      }
    } catch (err) {
      console.error("Google login initiation went wrong:", err);
      setOauthLoading(false);
      
      // Local graceful sandbox fallback if server endpoint is unreachable or errors out
      triggerSuccessToast("Gateway unreachable. Logging in with offline sandbox account.");
      setSignupName("Sovereign Sister");
      setSignupEmail("sister.sovereign@gmail.com");
      setGoogleAuthUser({ email: "sister.sovereign@gmail.com", name: "Sovereign Sister" });
      setSignUpStep(2);
    }
  };

  // Handle Sign-Up/Sign-In Preseed
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const name = signupName.trim() || "Pricilla";
    const email = signupEmail.trim() || `${name.toLowerCase()}@heyvin.ai`;
    
    let loc: 'Lagos' | 'Delhi' | 'Mexico' | 'Other' = "Other";
    if (signupBasedIn === 'Nigeria') loc = "Lagos";
    else if (signupBasedIn === 'India') loc = "Delhi";
    else if (signupBasedIn === 'Mexico') loc = "Mexico";

    const uid = Math.random().toString(36).substr(2, 9);
    const profile: UserProfile = {
      uid,
      email,
      username: name,
      location: loc,
      based_in: signupBasedIn,
      home_situation: signupHomeSituation,
      primary_goal: signupPrimaryGoal,
      created_at: new Date().toISOString()
    };

    // Pre-seed local storage tables with rich, lived-in context so stats are amazing!
    seedUserData(uid, loc);

    localStorage.setItem("heyvin_current_user", JSON.stringify(profile));
    setCurrentUser(profile);
    loadUserData(uid);
    
    // Auto-trigger sunday report modal toast inside system
    setTimeout(() => {
      triggerSuccessToast("Your Sovereignty Report is compiled and ready 📋");
    }, 1500);
  };

  // Seeding realistic demo data for competition demos
  const handleLoadDemoData = () => {
    if (!currentUser) return;
    const user_id = currentUser.uid;

    const uuid = () => Math.random().toString(36).substring(2, 15);

    // 1. Seed 21 check-ins across 3 weeks with realistic stress patterns
    const checkIns: CheckIn[] = [];
    const frictionSources = [
      "Heavy family chores",
      "Loud street traffic noise",
      "Generator fume/noise pressure",
      "Unannounced relative visits",
      "Domestic errand requests",
      "Power outage study disruption"
    ];

    for (let i = 20; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      let hour_of_day = 8;
      let stress_level = 30;
      let friction = "None - Sweet Spot Hour";
      let reclaimed = 2.5;
      let notes = "Secure study session, managed block boundary successfully.";

      if (i % 3 === 0) {
        hour_of_day = 7;
        stress_level = 20 + Math.floor(Math.random() * 15);
        friction = "None - Morning study block";
        reclaimed = 2.0 + Math.random();
        notes = "No family awake yet. Productive session before house demands.";
      } else if (i % 3 === 1) {
        hour_of_day = 14;
        stress_level = 40 + Math.random() * 15;
        friction = isWeekend ? "Domestic errand requests" : "Loud street traffic noise";
        reclaimed = 1.0 + Math.random() * 0.5;
        notes = "Friction rose due to neighborhood noise, protected study time using headphones.";
      } else {
        hour_of_day = 19;
        stress_level = 65 + Math.floor(Math.random() * 20); // High stress evening patterns
        friction = isWeekend ? "Unannounced relative visits" : "Generator fume/noise pressure";
        reclaimed = 0.5 + Math.random() * 0.5;
        notes = "Friction was very high due to environmental stressors. Reclaimed critical focus pocket anyway.";
      }

      checkIns.push({
        id: uuid(),
        user_id,
        date: date.toISOString().split('T')[0],
        day_of_week: date.getDay(),
        hour_of_day,
        stress_level: Math.floor(stress_level),
        friction_source: friction,
        hours_reclaimed: Math.round(reclaimed * 10) / 10,
        notes,
        created_at: date.toISOString()
      });
    }

    db.save(user_id, "check_ins", checkIns);

    // 2. Seed 8 completed tasks
    const demoTasks: Task[] = [
      { id: uuid(), user_id, title: "Talk to mom about securing study boundaries between 10am-12pm", category: "Personal Boundaries", completed: true, hours_estimate: 2, created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
      { id: uuid(), user_id, title: "Revise CS algorithm notes on search & sorting", category: "Academics", completed: true, hours_estimate: 3, created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
      { id: uuid(), user_id, title: "Set up professional LinkedIn profile photo and summary header", category: "Career Prep", completed: true, hours_estimate: 1, created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
      { id: uuid(), user_id, title: "Learn CSS flexbox layout and interactive responsive patterns", category: "Academics", completed: true, hours_estimate: 4, created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
      { id: uuid(), user_id, title: "Arrange academic resources at local digital library repository", category: "Life Admin", completed: true, hours_estimate: 2, created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
      { id: uuid(), user_id, title: "Establish a non-negotiable bedtime boundary for study winddown", category: "Personal Boundaries", completed: true, hours_estimate: 1.5, created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
      { id: uuid(), user_id, title: "Complete design brief for Google's UX/UI portfolio exercise", category: "Career Prep", completed: true, hours_estimate: 3, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: uuid(), user_id, title: "Rehearse refusal scripts for unexpected household dinner requests", category: "Personal Boundaries", completed: true, hours_estimate: 1, created_at: new Date(Date.now() - 1 * 86400000).toISOString() }
    ];

    db.save(user_id, "tasks", demoTasks);

    // 3. Seed 3 completed rehearsal sessions
    const demoRehearseSessions: RehearseSession[] = [
      {
        id: uuid(),
        user_id,
        topic: "Uncle visits and demands tea service during reading session",
        situation: "Your elder uncle unexpectedly visits and demands you stop studying immediately to serve tea and plates to his friends.",
        transcript: [
          "Uncle: Pritie, why are you locked in here? Stop that reading, go down and brew tea for our guests!",
          "User: Uncle, I respect your visit immensely, but I have a high-priority academic exam in exactly three hours that I must prepare for. Kemi is in the living hall and can support with brewing.",
          "Coach: Excellent assertive boundary! Firm, prompt, and delegating politely."
        ],
        analyzed_response: "Calculated Boundary Score: Outstanding Assertive Posture.",
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: uuid(),
        user_id,
        topic: "Sibling playing speaker music loudly",
        situation: "Your brother is playing music loudly on speakers during your critical coding study block.",
        transcript: [
          "Brother: I am playing my music in my own room, leave me alone!",
          "User: I hear that, but we share this study room boundary today. Let's arrange a split time, or can you use headphones until 5pm?",
          "Coach: Strong collaborative resolution! Keeps the conflict minimal while reserving sovereignty."
        ],
        analyzed_response: "Calculated Boundary Score: Solid Collaboration Posture.",
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: uuid(),
        user_id,
        topic: "Errand requests during exam prep block",
        situation: "Mom demands you run a 2-hour market errand during designated coding block.",
        transcript: [
          "Mom: I need you to go to the grocery store immediately!",
          "User: I will gladly go at 4pm when my study block is completed, or I can order it for delivery. Which is better?",
          "Coach: Dynamic resolution offering. Preserves mom's assistance needs while guarding your hourly commitment."
        ],
        analyzed_response: "Calculated Boundary Score: Perfect Alternative Proposal Posture.",
        created_at: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];

    db.save(user_id, "rehearse_sessions", demoRehearseSessions);

    // 4. Seed Sovereignty week data ending in exactly 71 score
    const weekScores: SovereigntyScore[] = [
      {
        id: uuid(),
        user_id,
        week_start: "Week 1",
        score: 55,
        consistency: 15,
        protection: 18,
        resilience: 12,
        growth: 10,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: uuid(),
        user_id,
        week_start: "Week 2",
        score: 64,
        consistency: 20,
        protection: 22,
        resilience: 14,
        growth: 8,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: uuid(),
        user_id,
        week_start: "Week 3",
        score: 71,
        consistency: 22,
        protection: 24,
        resilience: 15,
        growth: 10,
        created_at: new Date().toISOString()
      }
    ];

    db.save(user_id, "sovereignty_scores", weekScores);

    // Reload tasks
    setTasks(demoTasks);
    // Reload state reactive events for other views
    window.dispatchEvent(new Event('heyvin_db_update'));
    triggerSuccessToast("Demo data loaded.");
  };

  // Logo click count gesture for entering Stealth theme
  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 3) {
        // Toggle stealth
        const nextStealth = !stealthActive;
        setStealthActive(nextStealth);
        localStorage.setItem("stealth_active", String(nextStealth));
        
        // Quiet exit notification unless entering stealth
        if (!nextStealth && currentUser) {
          triggerSuccessToast(`Back in your Haven, ${currentUser.username}.`);
        }
        return 0;
      }
      
      // Clear interval
      if (logoClickTimeout.current) clearTimeout(logoClickTimeout.current);
      logoClickTimeout.current = setTimeout(() => {
        setLogoClicks(0);
      }, 1000);
      
      return next;
    });
  };

  // Toast notifier
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const triggerSuccessToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Calm breath cycle animator
  useEffect(() => {
    let interval: any = null;
    if (breathPhase !== 'idle') {
      interval = setInterval(() => {
        setBreathTimer(prev => {
          if (prev <= 1) {
            // Shift to next state of 4-7-8 breathing technique
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return 7;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return 8;
            } else if (breathPhase === 'exhale') {
              setBreathPhase('inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathPhase]);

  const startBreathing = () => {
    setBreathPhase('inhale');
    setBreathTimer(4);
  };

  const stopBreathing = () => {
    setBreathPhase('idle');
    setBreathTimer(0);
  };

  // Add a task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTaskTitle.trim()) return;

    const t: Task = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: currentUser.uid,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      completed: false,
      hours_estimate: 2,
      created_at: new Date().toISOString()
    };

    db.upsert(currentUser.uid, "tasks", t);
    setNewTaskTitle("");
    loadUserData(currentUser.uid);
  };

  // Toggle task
  const handleToggleTask = (tid: string) => {
    if (!currentUser) return;
    const taskList = db.get<Task>(currentUser.uid, "tasks");
    const found = taskList.find(t => t.id === tid);
    if (found) {
      found.completed = !found.completed;
      db.upsert(currentUser.uid, "tasks", found);
      loadUserData(currentUser.uid);
    }
  };

  // Submit check-in log (Feature 6 & Check-in tab)
  const handleSubmitCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newCheck: CheckIn = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: currentUser.uid,
      date: new Date().toISOString().split('T')[0],
      day_of_week: new Date().getDay(),
      hour_of_day: new Date().getHours(),
      stress_level: stressLevel,
      friction_source: frictionSource,
      hours_reclaimed: Number(hoursReclaimed),
      notes: journalNotes,
      created_at: new Date().toISOString()
    };

    // Save checkin
    db.upsert(currentUser.uid, "check_ins", newCheck);
    
    // Add write to circle activities so partners see
    const activities = db.get<any>(currentUser.uid, "circle_activity");
    activities.unshift({
      id: Math.random().toString(36).substr(2, 9),
      user_id: currentUser.uid,
      username: currentUser.username,
      activity_type: "check_in",
      anonymized_label: `${currentUser.username} completed an environmental check-in 🌿`,
      created_at: new Date().toISOString()
    });
    db.save(currentUser.uid, "circle_activity", activities);

    // If stress is high (>70%), immediately pop specific affirmation modal!
    if (stressLevel > 70) {
      const activeAff = getAffirmation(stressLevel);
      setShowHighStressAlert(activeAff);
    } else {
      triggerSuccessToast("Sovereignty check-in recorded successfully.");
    }

    // Reset checkin inputs
    setStressLevel(40);
    setFrictionSource("Heavy family chores");
    setHoursReclaimed(2.0);
    setJournalNotes("");

    // Recalculate score
    db.calculateSovereigntyScore(currentUser.uid);

    // Switch view
    setActiveTab("today");
  };

  // Handle interactive Rehearse completed popups
  const handleRehearseCallback = (aff: string) => {
    setTimedAffirmation(aff);
    // Automatically dismiss full-screen affirmation after 4 seconds
    setTimeout(() => {
      setTimedAffirmation(null);
    }, 4000);
  };

  const handleDismissTodayAff = () => {
    setTodayAffirmationDismissed(true);
    localStorage.setItem("dismissed_today_aff", new Date().toDateString());
  };

  const handleSignOut = () => {
    localStorage.removeItem("heyvin_current_user");
    setCurrentUser(null);
    setGuestView('landing');
  };

  // Simulated DB Check-ins count for dashboard triggers
  const getLogsCount = () => {
    if (!currentUser) return 0;
    return db.get(currentUser.uid, "check_ins").length;
  };

  // Base layout styling classes based on theme active
  const themeClassHeader = theme === "dark"
    ? "bg-slate-900 border-b border-slate-800 text-slate-100 shadow-sm"
    : stealthActive
      ? "bg-white border-b border-gray-200 text-gray-800 shadow-xs"
      : "bg-white border-b border-[#EDE8E0] text-[#1A1414] shadow-xs";

  const themeClassSidebar = theme === "dark"
    ? "bg-slate-950 border-r border-slate-800"
    : stealthActive
      ? "bg-white border-r border-gray-200"
      : "bg-white border-r border-[#EDE8E0]";

  const themeClassContent = theme === "dark"
    ? "bg-slate-950 text-slate-100 dark"
    : "bg-[#FAF7F2] text-[#1A1414]";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeClassContent} ${theme === 'dark' ? 'dark' : ''} relative overflow-hidden`}>
      
      {/* Subtle Centered Background Logo Theme */}
      {!stealthActive && currentUser && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none">
          <HeyvinLogo 
            size="40vw" 
            className="opacity-[0.012] md:opacity-[0.016] max-w-[340px] max-h-[340px] transform" 
            glowOpacity={0.15} 
          />
        </div>
      )}
      
      {/* 4-second overlay timed affirmation */}
      <AnimatePresence>
        {timedAffirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#E28E75] text-[#FFF4F0] z-50 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="space-y-6 max-w-2xl"
            >
              <Sparkles className="mx-auto w-10 h-10 text-orange-200 animate-pulse" />
              <blockquote className="text-2xl sm:text-3xl font-serif font-semibold italic leading-snug">
                "{timedAffirmation}"
              </blockquote>
              <p className="text-xs uppercase tracking-widest font-bold opacity-80 font-sans">
                Heyvin AI · RECONSTRUCTED SOVEREIGNTY
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High Stress checkin overlay banner */}
      <AnimatePresence>
        {showHighStressAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-center font-sans"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-orange-50 space-y-6"
            >
              <AlertCircle size={44} className="text-[#E28E75] mx-auto animate-pulse" />
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-orange-50 px-2.5 py-1 rounded-full">
                  High-Stress Alert (&gt;70%)
                </span>
                <p className="text-sm text-gray-700 leading-relaxed font-serif italic py-2">
                  "{showHighStressAlert}"
                </p>
              </div>
              <button
                onClick={() => setShowHighStressAlert(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-amber-900 cursor-pointer hover:bg-amber-950 transition-all font-sans"
              >
                Absorb Wisdom & Lock Boundaries
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sunday/Monday report compiler toast alert notifier */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-8 right-8 z-50 p-4 rounded-xl text-xs font-bold ring-1 border shadow-2xl flex items-center gap-3 cursor-pointer ${
              stealthActive
                ? "bg-blue-600 text-white border-blue-500 ring-blue-500/10"
                : "bg-amber-950 text-orange-50 border-orange-950 ring-amber-900/10"
            }`}
            onClick={() => {
              setActiveTab("report");
              setSuccessToast(null);
            }}
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication / Onboarding view */}
      {!currentUser ? (
        guestView === 'landing' ? (
          <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 bg-[#FAF7F2] text-[#1A1414] font-sans relative overflow-y-auto select-none">
            {/* Landing page top header bar */}
            <div className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-[#EDE8E0] mb-8">
              <div className="flex items-center gap-2">
                <HeyvinLogo size={32} glowOpacity={0.1} />
                <div className="flex flex-col text-left">
                  <span className="font-serif font-bold uppercase tracking-[0.15em] text-[#1A1414] text-base leading-none">HEYVIN AI</span>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-none mt-1">
                    drained by life, revived by Heyvin AI
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setGuestView('auth')}
                className="px-4 py-2 rounded-xl text-xs uppercase font-extrabold tracking-widest bg-[#7C2D3E] hover:bg-[#60202e] text-white transition-all cursor-pointer shadow-xs"
              >
                Sign In
              </button>
            </div>

            {/* Hero container */}
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-6 pt-4 pb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[#7C2D3E] font-semibold text-[10px] uppercase tracking-wider">
                <Sparkles size={10} className="text-[#7C2D3E]" /> Securing Sovereignty & Focus
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold font-serif tracking-tight text-[#1A1414] leading-tight max-w-3xl">
                Reclaim Your Focus. <br />
                <span className="text-[#7C2D3E]">Guard Your Sovereignty.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#7A6860] max-w-2xl leading-relaxed font-sans">
                A pristine, completely confidential success auditor crafted for ambitious young women. Work toward college, university degrees, or a safe career path, handle domestic chores with grace, and predict optimal slots of complete focus.
              </p>
              
              <div className="pt-4">
                <button 
                  onClick={() => setGuestView('auth')}
                  className="px-8 py-4 rounded-xl text-xs uppercase font-extrabold tracking-wider bg-[#7C2D3E] hover:bg-[#60202e] text-white transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-md inline-flex items-center gap-2"
                >
                  <span>Enter Secure Chamber</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* USP columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12 text-left">
                <div className="p-6 bg-white border border-[#EDE8E0] rounded-xl shadow-xs space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#7C2D3E] flex items-center justify-center">
                    <Shield size={16} />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#1A1414]">Stealth Cover Shield</h3>
                  <p className="text-xs text-[#7A6860] leading-relaxed font-sans">
                    Triple-click your dashboard logo to instantly morph into an unassuming academic Syllabus Portal under sudden family or guest intrusion.
                  </p>
                </div>

                <div className="p-6 bg-white border border-[#EDE8E0] rounded-xl shadow-xs space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#C9983A] flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#1A1414]">Friction & Time Auditing</h3>
                  <p className="text-xs text-[#7A6860] leading-relaxed font-sans">
                    Measure weekly autonomy levels, record daily domestic workload overheads, and see forecasted slots of quiet sweet-spots.
                  </p>
                </div>

                <div className="p-6 bg-white border border-[#EDE8E0] rounded-xl shadow-xs space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#543124] flex items-center justify-center">
                    <Brain size={16} />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#1A1414]">Guided AI Chronicle</h3>
                  <p className="text-xs text-[#7A6860] leading-relaxed font-sans">
                    Decompress and safely dump anxious thoughts, request automated metric reporting, and secure temporary Focus Lockouts.
                  </p>
                </div>
              </div>

              {/* Sisterhood Interactive Insight Chronicles & Feed */}
              <SovereignChroniclesFeed />

              {/* Dynamic Interactive Showcases (Calculator, Shoutbox, Trust Checks) */}
              <LandingInteractiveShowcase />

            </div>

            {/* Footer */}
            <div className="w-full max-w-5xl py-6 border-t border-[#EDE8E0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A6860] gap-4 mt-8">
              <div>
                © 2026 Heyvin Team. All Rights Reserved. Absolute privacy and local data encryption.
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href="https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS" 
                  target="_blank" 
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-xs text-[#7A6860] hover:text-red-600 transition-colors"
                  id="landing_youtube_contact"
                >
                  <Youtube size={14} className="text-red-500 hover:scale-110 transition-transform" />
                  <span>Contact Us (YouTube)</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#FAF7F2] select-none">
            
            {/* Left Panel: Security Sandbox Indicator & Advisory Tips */}
            <div className="lg:col-span-5 bg-[#7C2D3E] text-orange-50 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-800/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-8 relative z-10">
                <button 
                  onClick={() => setGuestView('landing')} 
                  className="text-orange-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start cursor-pointer group"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Landing Page
                </button>

                <div className="space-y-4">
                  <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#E28E75] bg-red-950/40 px-3 py-1 rounded-full inline-block">
                    Zero-Telemetry Sandbox
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                    Every Study Block, <br/>
                    <span className="text-[#E28E75]">Utterly Confidential.</span>
                  </h2>
                  <p className="text-sm text-rose-100 leading-relaxed font-sans max-w-md">
                    We do not store your reports, logs, or diary logs on global servers. Everything resides inside your physical browser cache proxy — completely immune to network intrusion.
                  </p>
                </div>

                {/* Interactive Ticker Advisory Carousel on Left Column */}
                <div className="bg-red-950/30 border border-red-800/30 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                    <span>Tactical Focus Tip</span>
                    <span className="font-mono">Secure Advisory</span>
                  </div>
                  <p className="text-xs text-rose-50 leading-relaxed italic font-serif">
                    "Choose an anonymous or shorten first name (pseudonym) under credentials as a secondary security barrier so unannounced relatives can never trace your academic pursuits."
                  </p>
                </div>

                {/* Hard Privacy Checklist Ticks */}
                <div className="space-y-3 pt-4 border-t border-red-800/30">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-100">
                    <span className="p-0.5 bg-emerald-950/50 text-emerald-400 rounded-md">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>Localized cryptographic storage</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-100">
                    <span className="p-0.5 bg-emerald-950/50 text-emerald-400 rounded-md">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>No unrequested diagnostic logs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-100">
                    <span className="p-0.5 bg-emerald-950/50 text-emerald-400 rounded-md">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>Active double-stealth cover (StudySync)</span>
                  </div>
                </div>
              </div>

              {/* Quick support link */}
              <div className="pt-8 text-xs text-rose-200 border-t border-red-800/20 mt-8 relative z-10 flex items-center justify-between">
                <span>Heyvin Secure Workspace v2.8</span>
                <a 
                  href="https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS" 
                  target="_blank" 
                  rel="noreferrer noopener"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </div>
                 {/* Right Panel: Active Credential Forms */}
            <div className="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center max-w-xl mx-auto w-full space-y-6 font-sans">
              
              {/* Stepper Progress Indicator */}
              <div className="flex items-center justify-between pb-4 border-b border-orange-100/30">
                <button
                  type="button"
                  onClick={() => signUpStep > 1 && setSignUpStep(1)}
                  className={`flex items-center gap-1.5 transition-all text-left ${signUpStep > 1 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9.5px] font-bold transition-colors ${signUpStep >= 1 ? 'bg-[#7C2D3E] text-white' : 'bg-gray-150 text-gray-400'}`}>
                    {signUpStep > 1 ? "✓" : "1"}
                  </span>
                  <span className={`text-[10px] font-bold tracking-tight ${signUpStep === 1 ? 'text-[#7C2D3E]' : 'text-gray-400'}`}>Identity</span>
                </button>
                <div className="h-px bg-orange-100 flex-1 mx-2" />
                <button
                  type="button"
                  onClick={() => signUpStep > 2 ? setSignUpStep(2) : signUpStep === 1 && signupName.trim() && setSignUpStep(2)}
                  className={`flex items-center gap-1.5 transition-all text-left ${signUpStep > 2 || (signUpStep === 1 && signupName.trim()) ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9.5px] font-bold transition-colors ${signUpStep >= 2 ? 'bg-[#7C2D3E] text-white' : 'bg-gray-150 text-gray-400'}`}>
                    {signUpStep > 2 ? "✓" : "2"}
                  </span>
                  <span className={`text-[10px] font-bold tracking-tight ${signUpStep === 2 ? 'text-[#7C2D3E]' : 'text-gray-400'}`}>Environment</span>
                </button>
                <div className="h-px bg-orange-100 flex-1 mx-2" />
                <button
                  type="button"
                  onClick={() => signUpStep === 2 && setSignUpStep(3)}
                  className={`flex items-center gap-1.5 transition-all text-left ${signUpStep === 2 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9.5px] font-bold transition-colors ${signUpStep === 3 ? 'bg-[#7C2D3E] text-white' : 'bg-gray-150 text-gray-400'}`}>
                    3
                  </span>
                  <span className={`text-[10px] font-bold tracking-tight ${signUpStep === 3 ? 'text-[#7C2D3E]' : 'text-gray-400'}`}>Priorities</span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#7C2D3E] block font-mono">
                  Step {signUpStep} of 3: {signUpStep === 1 ? "Credentials & Sign-On" : signUpStep === 2 ? "Environmental Calibration" : "Priorities & Activation"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-amber-950 uppercase tracking-tight">
                  {signUpStep === 1 
                    ? (googleAuthUser ? "Credentials Connected" : "Access Your Space") 
                    : signUpStep === 2 
                      ? "Describe Your Environment" 
                      : "Establish Sovereignty Target"}
                </h1>
                <p className="text-xs text-[#7A6860] leading-relaxed max-w-sm">
                  {signUpStep === 1 
                    ? (googleAuthUser ? "Your identity is secure. Confirm your profile pseudonym below to proceed." : "Create a local pseudonym space or connect instantly to restore your study calendars securely.")
                    : signUpStep === 2
                      ? "Domestic situations dictate how boundaries must be paced. Provide your current context."
                      : "Set your weekly target focus block to seed your personal metrics."
                  }
                </p>
              </div>

              {/* Interactive Keycard Badge Live Preview */}
              <div className="bg-radial from-amber-950 to-[#60202e] text-orange-50 p-4 rounded-xl border border-amber-900/40 relative overflow-hidden group shadow-md transition-all duration-355 hover:shadow-lg">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#7C2D3E]/35 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#E28E75]/15 rounded-full blur-xl" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-widest text-[#E28E75] font-mono leading-none block">SOVEREIGN ACCESS KEYCARD</span>
                    <span className="text-xs font-serif font-bold tracking-tight block">
                      {signupName.trim() || googleAuthUser?.name || "Anonymous Sister"}
                    </span>
                    <span className="text-[9.5px] font-mono text-rose-200 block">
                      {signupEmail.trim() || googleAuthUser?.email || "sandbox.key@heyvin.internal"}
                    </span>
                  </div>
                  <div className="p-1 px-2.5 bg-red-950/40 border border-red-800/10 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider text-[#E28E75]">
                    {googleAuthUser ? "OAUTH SECURE" : "LOCAL USER"}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-white/10 relative z-10 text-[9.5px] font-sans">
                  <div>
                    <span className="text-[#E28E75] uppercase block text-[8px] font-mono">Location BASE</span>
                    <span className="font-semibold text-white">{signupBasedIn}</span>
                  </div>
                  <div>
                    <span className="text-[#E28E75] uppercase block text-[8px] font-mono">Home Status</span>
                    <span className="font-semibold text-white truncate max-w-[90px] block font-sans" title={signupHomeSituation}>
                      {signupHomeSituation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#E28E75] uppercase block text-[8px] font-mono">Strategic Goal</span>
                    <span className="font-semibold text-white truncate max-w-[90px] block font-sans" title={signupPrimaryGoal}>
                      {signupPrimaryGoal}
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 1: IDENTITY CREDENTIALS */}
              {signUpStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Google OAuth Launcher Section */}
                  {!googleAuthUser && (
                    <div className="space-y-3 pb-4 border-b border-orange-100/40">
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={oauthLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-amber-500/10 text-xs text-gray-700 font-bold tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-55"
                      >
                        {oauthLoading ? (
                          <RefreshCw size={14} className="animate-spin text-[#7C2D3E]" />
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        )}
                        <span>{oauthLoading ? "Connecting Secure Pipe..." : "Sign-On with Google OAuth"}</span>
                      </button>
                      <p className="text-[9px] text-center text-gray-400 font-mono leading-none">
                        Utilizes secure sandboxed popup tokens. Fits standard university or college accounts.
                      </p>
                    </div>
                  )}

                  {/* Prefilled indicator if using Google */}
                  {googleAuthUser && (
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-800 uppercase block">Secure Google Vault Linked</span>
                        <span className="text-[10.5px] font-semibold text-emerald-950 font-mono block">{signupEmail}</span>
                      </div>
                      <span className="p-1 bg-emerald-600 text-white rounded-full text-[10px]">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A6860]">First Name / Pseudonym</label>
                    <input
                      type="text"
                      required
                      placeholder="Pricilla"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#7C2D3E]/10 text-gray-800 bg-white focus:outline-none"
                    />
                  </div>

                  {!googleAuthUser && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A6860]">Study-Safe Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="pricilla@gmail.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#7C2D3E]/10 text-gray-800 bg-white focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="pt-3">
                    <button
                      type="button"
                      disabled={!signupName.trim() || (!googleAuthUser && !signupEmail.trim())}
                      onClick={() => setSignUpStep(2)}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 transition-all hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <span>Continue to Environment Setup</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DOMESTIC & ENVIRONMENT ENVIRONMENT */}
              {signUpStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A6860] block">Where are you based?</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Nigeria', 'India', 'Mexico', 'Other'] as const).map((country) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => setSignupBasedIn(country)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer text-center ${
                            signupBasedIn === country
                              ? "border-[#E28E75] bg-rose-50 text-amber-950 font-extrabold"
                              : "border-gray-200 text-gray-400 bg-white"
                          }`}
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A6860] block">What is your current Home Living situation?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { val: 'Living with parents', desc: 'Frequent spontaneous chore assignments' },
                        { val: 'Partner', desc: 'Shared task delegation schedule' },
                        { val: 'In-laws', desc: 'High cultural priority on domestic attendance' },
                        { val: 'Siblings', desc: 'Dynamic shared study interruptions' },
                        { val: 'Other', desc: 'Custom environment parameters' }
                      ].map((sit) => (
                        <button
                          key={sit.val}
                          type="button"
                          onClick={() => setSignupHomeSituation(sit.val as any)}
                          className={`p-3 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                            signupHomeSituation === sit.val
                              ? "border-[#7C2D3E] bg-rose-50/40 font-bold"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="#7C2D3E block leading-none font-bold text-amber-950">{sit.val}</div>
                          <span className="text-[9px] text-[#7A6860] font-normal leading-tight block mt-1">{sit.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSignUpStep(1)}
                      className="py-3 px-4 rounded-xl text-xs font-bold text-amber-900 border border-orange-200 hover:bg-orange-50 bg-white transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignUpStep(3)}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 transition-all hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Next: Select Goal</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PRIORITIES & TARGET ACTIVATION */}
              {signUpStep === 3 && (
                <form onSubmit={handleSignUp} className="space-y-4 animate-fadeIn">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A6860] block">Primary Study Goal</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { val: 'University degree', desc: 'Preparing for examinations, lectures, and thesis submissions.' },
                        { val: 'Career growth', desc: 'Learning technical frameworks, mock interviewing, and portfolio writing.' },
                        { val: 'Starting a business', desc: 'Prototyping projects, finding pilot users, and exploring enterprise models.' }
                      ].map((goalOption) => (
                        <button
                          key={goalOption.val}
                          type="button"
                          onClick={() => setSignupPrimaryGoal(goalOption.val as any)}
                          className={`p-3.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                            signupPrimaryGoal === goalOption.val
                              ? "border-[#7C2D3E] bg-rose-50/40 font-bold"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="block leading-none font-bold text-amber-950">{goalOption.val}</div>
                          <span className="text-[9.5px] text-[#7A6860] font-normal leading-normal block mt-1">{goalOption.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reclaimed Focus Blocks Initial Target Meter */}
                  <div className="p-4 bg-[#FAF7F2] border border-orange-100 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-[#7C2D3E] uppercase tracking-wide">
                      <span>🎯 Initial weekly target</span>
                      <span className="font-mono">8 Sessions / week</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      We pre-load your workspace agenda with 8 custom study-lock slots tailored to help cushion domestic chores. You can adjust this schedule inside your profile calendar settings anytime.
                    </p>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSignUpStep(2)}
                      className="py-3 px-4 rounded-xl text-xs font-bold text-amber-900 border border-orange-200 hover:bg-orange-50 bg-white transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-amber-900 hover:bg-[#60202e] transition-all hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Establish Sovereign Space 🌟</span>
                    </button>
                  </div>

                  {googleAuthUser && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setGoogleAuthUser(null);
                          setSignUpStep(1);
                        }}
                        className="text-[10px] text-amber-800 hover:underline cursor-pointer"
                      >
                        Disconnect linked Google account
                      </button>
                    </div>
                  )}
                </form>
              )}

            </div>

            </div>
          </div>
        )
      ) : (
        /* Dynamic Navigation Dashboard Layout */
        <div className="flex-1 flex flex-col md:flex-row relative">
          
          {/* Header (Desktop logo triple-tap area & Quick Exit bar) */}
          <header className={`fixed top-0 left-0 w-full z-20 flex justify-between items-center px-4 py-3 border-b transition-all ${themeClassHeader}`}>
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-2 cursor-pointer select-none"
              title="Tip: Triple-click to toggle Stealth mode StudySync"
            >
              <div className={`p-1.5 rounded-lg flex items-center justify-center ${stealthActive ? "bg-gray-100 text-gray-400" : ""}`}>
                {stealthActive ? <Calendar size={18} /> : <HeyvinLogo size={24} glowOpacity={0} />}
              </div>
              <div>
                <h1 className={stealthActive ? "text-sm font-extrabold tracking-wider font-sans text-gray-700" : "text-sm font-semibold tracking-[0.15em] font-serif uppercase text-amber-950"}>
                  {stealthActive ? "StudySync" : "Heyvin AI"}
                </h1>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">
                  {stealthActive ? "v4.1.2 Academic Planner" : "drained by life, revived by Heyvin AI"}
                </p>
              </div>
            </div>

            {/* Quick exit header block */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Global Theme Toggle (Haven Light / Midnight Dark) */}
              <button
                onClick={toggleTheme}
                id="theme_toggle_btn"
                className={`p-2 rounded-xl transition-all cursor-pointer border flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-bold ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-yellow-400 border-slate-700 hover:bg-slate-700'
                    : stealthActive
                      ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      : 'bg-orange-50/80 text-amber-900 border-orange-100/70 hover:bg-orange-100'
                }`}
                title={theme === 'dark' ? "Switch to Haven light theme" : "Switch to late-night Dark mode"}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span className="hidden sm:inline">{theme === 'dark' ? "Haven" : "Dark"}</span>
              </button>

              <button
                onClick={handleSignOut}
                className={`px-3.5 py-1.5 rounded-xl font-sans font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 cursor-pointer transition-all border ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : stealthActive
                      ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      : 'bg-orange-50 text-amber-900 border-orange-100 hover:bg-orange-100'
                }`}
                title="Sign out of your account"
              >
                <LogOut size={12} className="rotate-180" />
                <span>Sign Out</span>
              </button>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1 text-gray-400 hover:text-gray-600"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </header>

          {/* Sidebar Menu (Desktop) */}
          <aside className={`hidden md:flex flex-col justify-between w-60 pt-20 pb-4 px-4 sticky top-0 h-screen z-10 transition-all ${themeClassSidebar}`}>
            <nav className="space-y-1.5 flex-1 mt-4 overflow-y-auto pr-1">
              {/* Menu listings */}
              {[
                { id: "today", icon: Calendar, label: "Today", stealth: "Planner" },
                { id: "tasks", icon: Check, label: "Tasks", stealth: "To-Do" },
                { id: "rehearse", icon: Brain, label: "Rehearse", stealth: "Conversations" },
                { id: "calm", icon: Heart, label: "Calm", stealth: "Rest" },
                { id: "score", icon: Crown, label: "Score", stealth: "Grades" },
                { id: "journal", icon: BookText, label: "Journal", stealth: "Chronicle" },
                { id: "heatmap", icon: MapIcon, label: "Friction Map", stealth: "Metrics Map" },
                { id: "focus", icon: Lock, label: "Focus Lock", stealth: "Task Shield" },
                { id: "checkin", icon: Smartphone, label: "Sovereignty Log", stealth: "Metrics Log" },
                { id: "circles", icon: Users, label: "Circles", stealth: "Peer Group" },
                { id: "predict", icon: Compass, label: "Predict", stealth: "Timeline" },
                { id: "report", icon: FileText, label: "Weekly Report", stealth: "Syllabus Audit" },
                { id: "settings", icon: Settings, label: "Settings", stealth: "System Configuration" }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                
                // Color choices
                let activeStyle = active 
                  ? "bg-[#7C2D3E] text-white font-semibold" 
                  : "text-[#7A6860] hover:bg-[#FAF7F2] hover:text-[#1A1414]";
                  
                if (stealthActive) {
                  activeStyle = active 
                    ? "bg-blue-600 text-white font-semibold" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
                }

                if (theme === 'dark') {
                  activeStyle = active
                    ? "bg-slate-800 text-white font-semibold border-l-4 border-[#7C2D3E]"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white";
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-sans capitalize transition-all cursor-pointer ${activeStyle}`}
                  >
                    <Icon size={16} />
                    <span>{stealthActive ? tab.stealth : tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom logout and Stealth trigger indicator */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleLoadDemoData}
                className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-[10px] font-sans font-semibold uppercase tracking-wider text-gray-400 hover:text-amber-800 hover:bg-orange-50/20 text-left transition-all cursor-pointer"
              >
                <Database size={16} />
                <span>Load Demo Data</span>
              </button>

              <a
                href="https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS"
                target="_blank"
                rel="noreferrer noopener"
                className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-sans text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-left transition-all cursor-pointer"
                id="sidebar_youtube_contact"
              >
                <Youtube size={16} className={stealthActive ? "text-gray-400" : "text-red-500"} />
                <span>{stealthActive ? "Video Resources" : "Contact Us"}</span>
              </a>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-sans text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-left transition-all cursor-pointer"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>

              {/* Stealth indicator: only visible in real mode */}
              {!stealthActive && (
                <div 
                  onClick={() => setStealthActive(true)}
                  className="flex items-center gap-2 px-3 py-1 cursor-pointer select-none group"
                >
                  <Lock size={12} className="text-gray-300 group-hover:text-amber-500 animate-pulse" />
                  <span className="text-[10px] text-gray-300 font-mono tracking-wider group-hover:text-amber-500 uppercase leading-none">
                    STEALTH_ENABLED
                  </span>
                </div>
              )}
            </div>
          </aside>

          {/* Dynamic Mobile Menu Overlay */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`fixed inset-0 z-30 pt-16 px-6 flex flex-col md:hidden w-64 border-r justify-between pb-6 shadow-2xl ${themeClassSidebar}`}
              >
                <nav className="space-y-2 py-4 overflow-y-auto max-h-[70vh]">
                  {[
                    { id: "today", icon: Calendar, label: "Today", stealth: "Planner" },
                    { id: "tasks", icon: Check, label: "Tasks", stealth: "To-Do" },
                    { id: "rehearse", icon: Brain, label: "Rehearse", stealth: "Notes" },
                    { id: "calm", icon: Heart, label: "Calm", stealth: "Break" },
                    { id: "score", icon: Crown, label: "Score", stealth: "Grades" },
                    { id: "journal", icon: BookText, label: "Journal", stealth: "Chronicle" },
                    { id: "heatmap", icon: MapIcon, label: "Friction Map", stealth: "Metrics Map" },
                    { id: "focus", icon: Lock, label: "Focus Lock", stealth: "Task Shield" },
                    { id: "checkin", icon: Smartphone, label: "Sovereignty Log", stealth: "Log" },
                    { id: "circles", icon: Users, label: "Circles", stealth: "Peer Group" },
                    { id: "predict", icon: Compass, label: "Predict", stealth: "Timeline" },
                    { id: "report", icon: FileText, label: "Weekly Report", stealth: "Syllabus Audit" },
                    { id: "settings", icon: Settings, label: "Settings", stealth: "System Configuration" }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    
                    let activeStyle = active 
                      ? "bg-[#7C2D3E] text-white font-bold" 
                      : "text-[#7A6860] hover:bg-[#FAF7F2]";
                      
                    if (stealthActive) {
                      activeStyle = active 
                        ? "bg-blue-600 text-white font-bold" 
                        : "text-gray-600 hover:bg-gray-100";
                    }

                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-xs font-sans transition-all cursor-pointer ${activeStyle}`}
                      >
                        <Icon size={16} />
                        <span>{stealthActive ? tab.stealth : tab.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <button
                  onClick={handleLoadDemoData}
                  className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-[10px] font-sans font-semibold uppercase tracking-wider text-gray-400 hover:text-amber-800 text-left cursor-pointer"
                >
                  <Database size={16} />
                  <span>Load Demo Data</span>
                </button>

                <a
                  href="https://youtube.com/@heyvinaiteam?si=lI8AsHrtGB1Ow9WS"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-sans text-gray-400 text-left cursor-pointer"
                  id="mobile_youtube_contact"
                >
                  <Youtube size={16} className={stealthActive ? "text-gray-400" : "text-red-500"} />
                  <span>{stealthActive ? "Video Resources" : "Contact Us"}</span>
                </a>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-sans text-gray-400 text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main workspace (tabs rendering) */}
          <main className="flex-1 min-h-screen pt-20 px-4 sm:px-8 pb-20 md:pb-8 overflow-y-auto">
                  {/* View Today Dashboard */}
            {activeTab === "today" && currentUser && (
              <div id="today_dashboard" className="space-y-6 max-w-4xl mx-auto">
                {/* Greeting Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#EDE8E0] pb-4 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold font-serif tracking-tight text-[#1A1414]">
                      Good Day, {currentUser.username}
                    </h2>
                    <p className="text-xs font-sans text-[#7A6860] uppercase tracking-wider font-semibold mt-1">
                      {stealthActive 
                        ? "Your review targets & academic preparation metrics" 
                        : "Your active success audits and sovereignty forecast timelines"}
                    </p>
                  </div>

                  {/* Lock In Emergency Focus Lock Trigger Button (Accessible as safety trigger) */}
                  <button
                    onClick={() => setActiveTab("focus")}
                    className={`px-4 py-2 rounded-xl text-xs uppercase font-extrabold tracking-wider font-sans flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all text-center ${
                      stealthActive 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-[#7C2D3E] hover:bg-[#60202e] text-white"
                    }`}
                  >
                    <span>🔒 Lock In Focus</span>
                  </button>
                </div>

                {/* 1. Morning Briefing Card (new) */}
                <MorningBriefingCard 
                  userId={currentUser.uid}
                  stealthActive={stealthActive}
                  pendingTasksCount={tasks.filter(t => !t.completed).length}
                  lastSovereigntyScore={db.calculateSovereigntyScore(currentUser.uid).score}
                  predictedSafeWindow="5:00 AM — 8:00 AM"
                  lastJournalMood={(() => {
                    const jrnl = db.get<any>(currentUser.uid, "journal_entries");
                    if (jrnl && jrnl.length > 0) {
                      const sorted = [...jrnl].sort((a,b) => b.created_at.localeCompare(a.created_at));
                      return sorted[0].mood;
                    }
                    return "Okay";
                  })()}
                />

                {/* 2. Affirmation card (dismissable) */}
                {!todayAffirmationDismissed && (
                  <div className={`p-5 rounded-xl border border-[#EDE8E0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all bg-white border-l-4 ${
                    stealthActive ? "border-l-blue-600" : "border-l-[#7C2D3E]"
                  }`}>
                    <div className="flex gap-3">
                      <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${stealthActive ? "text-blue-600" : "text-[#7C2D3E]"}`} />
                      <blockquote className="text-sm text-[#1A1414] font-serif italic leading-relaxed">
                        "{getAffirmation()}"
                      </blockquote>
                    </div>
                    <button
                      onClick={handleDismissTodayAff}
                      className="text-[10px] uppercase font-bold text-gray-400 hover:text-gray-600 whitespace-nowrap cursor-pointer hover:underline"
                    >
                      Got It
                    </button>
                  </div>
                )}

                {/* Stats layout: Sovereign Card and Reclaimed Card side-by-side or stacked cleanly */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* 3. Sovereignty Score hero card (Centered Ring SVG with Lora Gold numeric core) */}
                  <div 
                    onClick={() => setActiveTab("score")}
                    className="bg-white border border-[#EDE8E0] rounded-xl p-6 shadow-xs cursor-pointer hover:border-[#7C2D3E]/30 transition-all text-center space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7A6860]">
                        {stealthActive ? "DEGREE READINESS RATIO" : "SOVEREIGNTY LEVEL"}
                      </span>
                      <Crown size={14} className={stealthActive ? "text-blue-600" : "text-[#C9983A]"} />
                    </div>

                    <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="62"
                          stroke="#FAF7F2"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="62"
                          stroke={stealthActive ? "#2563EB" : "#7C2D3E"}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 62}
                          strokeDashoffset={2 * Math.PI * 62 * (1 - db.calculateSovereigntyScore(currentUser.uid).score / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="text-center">
                        <span className="text-[48px] font-serif font-bold text-[#C9983A] leading-none block">
                          {db.calculateSovereigntyScore(currentUser.uid).score}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#7A6860] block mt-1">
                          Rating
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-xs font-serif font-bold text-[#7C2D3E] block">
                        {stealthActive ? "Syllabus Standard Strong" : "Holding Ground ⚔️"}
                      </span>
                    </div>
                  </div>

                  {/* 4. Hours Reclaimed Card */}
                  <div 
                    onClick={() => setActiveTab("checkin")}
                    className="bg-white border border-[#EDE8E0] rounded-xl p-6 shadow-xs cursor-pointer hover:border-gray-300 transition-all flex flex-col justify-between min-h-[220px]"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7A6860]">
                        {stealthActive ? "STUDY TIMEFRAME PRESERVED" : "HOURS RECLAIMED"}
                      </span>
                      <Smartphone size={14} className={stealthActive ? "text-blue-600" : "text-[#7C2D3E]"} />
                    </div>

                    <div className="py-6 text-center">
                      <div className="font-serif text-5xl font-extrabold text-[#1A1414] leading-none">
                        15.2 <span className="text-sm font-sans font-extrabold text-[#7A6860] tracking-widest uppercase font-bold">hrs</span>
                      </div>
                      <p className="text-[11px] font-sans text-[#7A6860] mt-2 leading-relaxed">
                        Carefully guarded from domestic chores and street noise overrides.
                      </p>
                    </div>

                    <div className="text-center border-t border-gray-100 pt-3">
                      <span className="text-[10px] uppercase font-extrabold text-[#7C2D3E] hover:underline cursor-pointer">
                        Add New Sovereignty Audit Log →
                      </span>
                    </div>
                  </div>

                </div>

                {/* 5. Friction map / today's safe windows */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Live Mini Heatmap Preview Card */}
                  <div 
                    onClick={() => setActiveTab("heatmap")}
                    className="bg-white border border-[#EDE8E0] rounded-xl p-5 shadow-xs cursor-pointer hover:border-[#7C2D3E]/20 transition-all space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7A6860]">
                        {stealthActive ? "DOMESTIC ENGAGEMENT CHART" : "DOMESTIC FRICTION HEATMAP"}
                      </span>
                      <span className="text-[9px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase border border-red-100">
                        Live Analytics
                      </span>
                    </div>

                    {/* Miniature contribution representation */}
                    <div className="grid grid-cols-7 gap-1 max-w-[210px] mx-auto p-1.5 bg-[#FAF7F2] rounded-lg">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const intensity = [3, 1, 0, 4, 2, 0, 1, 3, 2, 4, 1, 0, 2, 3, 0, 1, 4, 2, 3, 1, 0, 2, 0, 1, 3, 4, 2, 1][i];
                        let bg = "bg-gray-100";
                        if (intensity === 1) bg = stealthActive ? "bg-blue-100" : "bg-[#7C2D3E]/20";
                        else if (intensity === 2) bg = stealthActive ? "bg-blue-300" : "bg-[#7C2D3E]/45";
                        else if (intensity === 3) bg = stealthActive ? "bg-blue-500" : "bg-[#7C2D3E]/70";
                        else if (intensity === 4) bg = stealthActive ? "bg-blue-700" : "bg-[#7C2D3E]";
                        return <div key={i} className={`w-3.5 h-3.5 rounded-xs ${bg} transition-all`} />;
                      })}
                    </div>
                    
                    <p className="text-[11px] font-sans text-center text-gray-500">
                      Our metrics reveal heavy chore spikes on weekend mornings. View detail map trends →
                    </p>
                  </div>

                  {/* Today's Safe Study Windows */}
                  <div className="bg-white border border-[#EDE8E0] rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7A6860]">
                        {stealthActive ? "PREDICTED STUDY WINDOWS" : "TODAY'S SAFE STUDY WINDOWS"}
                      </span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-100">
                        Optimal
                      </span>
                    </div>

                    <div className="space-y-2.5 font-sans">
                      <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 flex items-center justify-between animate-pulse">
                        <div>
                          <strong className="text-xs text-emerald-950 block font-serif">5:00 AM — 8:00 AM</strong>
                          <span className="text-[10px] text-emerald-700 block mt-0.5">Quiet early hours sweet spot (Safe from chores)</span>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-800 font-mono">100%</span>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EDE8E0] flex items-center justify-between">
                        <div>
                          <strong className="text-xs text-gray-800 block font-serif">7:00 PM — 9:00 PM</strong>
                          <span className="text-[10px] text-[#7A6860] block mt-0.5">Post-dinner wind down window (Power backlogs expected)</span>
                        </div>
                        <span className="text-xs font-semibold text-[#7A6860] font-mono">60%</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 6. Pending tasks preview (top 3) with direct check triggers */}
                <div className="bg-white border border-[#EDE8E0] rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-1.5 col">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7A6860]">
                        {stealthActive ? "STRATEGIC CHECKLIST PREVIEW" : "PENDING SUCCESS PRIORITIES (TOP 3)"}
                      </span>
                    </div>
                    <button 
                      onClick={() => setActiveTab("tasks")}
                      className="text-[10px] uppercase font-bold text-[#7C2D3E] hover:underline cursor-pointer"
                    >
                      View All Priorities →
                    </button>
                  </div>

                  {tasks.filter(t => !t.completed).length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 font-sans">
                      🎉 All standard priorities successfully answered! Reclaim another hour now.
                    </div>
                  ) : (
                    <div className="space-y-2 font-sans overflow-hidden">
                      {tasks.filter(t => !t.completed).slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleToggleTask(t.id)}
                          className="p-3 rounded-xl border border-[#EDE8E0] bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/40 transition-all flex items-center justify-between cursor-pointer group hover:border-[#7C2D3E]/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-md border border-gray-350 flex items-center justify-center group-hover:border-[#7C2D3E]">
                              {t.completed && <Check size={10} className="text-[#7C2D3E]" />}
                            </div>
                            <span className="text-xs font-medium text-[#1A1414] font-serif leading-normal">{t.title}</span>
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full capitalize border border-gray-100">
                            {t.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 7. Tomorrow's forecast (if unlocked) */}
                <div 
                  onClick={() => setActiveTab("predict")}
                  className="bg-white border border-[#EDE8E0] rounded-xl p-6 shadow-xs cursor-pointer hover:border-[#7C2D3E]/20 transition-all"
                >
                  <div className="flex justify-between items-baseline mb-4">
                    <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#7A6860]">
                      {stealthActive ? "FORWARD SCHEDULE MODEL" : "TOMORROW'S SOVEREIGNTY FORECAST"}
                    </h4>
                    <span className="text-[9px] bg-orange-50 text-[#C47B1A] px-2 py-0.5 rounded-full font-bold uppercase border border-orange-100">
                      Tomorrow's Prediction
                    </span>
                  </div>

                  {getLogsCount() < 5 ? (
                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 font-sans">
                      <Lock size={16} className="text-gray-300 mx-auto" />
                      <p className="text-xs font-bold text-[#1A1414] font-serif">Forecast locked</p>
                      <p className="text-[11px] text-[#7A6860] leading-relaxed max-w-sm">
                        Complete 5 check-ins to activate tomorrow's predicted timeline. Locked at {getLogsCount()}/5 logs completed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 font-sans">
                      <div className="h-4 bg-gray-100 rounded-full w-full overflow-hidden flex">
                        {Array.from({ length: 24 }).map((_, i) => {
                          let color = "bg-green-300";
                          if (i >= 17 && i <= 21) color = "bg-red-400";
                          else if (i >= 9 && i <= 12) color = "bg-yellow-300";
                          return <div key={i} className={`h-full flex-1 border-r border-white/20 ${color}`} />;
                        })}
                      </div>
                      <div className="p-3 rounded-lg border border-green-50 text-green-800 bg-green-50/50 flex gap-2 text-xs">
                        <Check size={14} className="flex-shrink-0 mt-0.5 text-green-600" />
                        <p className="leading-relaxed text-[11px]">
                          Tomorrow's best study window predicted: <strong>5:00 AM — 8:00 AM</strong>. Focus targets are optimal during these hours.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* View Check-In Log (Feature 6 & Audit Log) */}
            {activeTab === "checkin" && (
              <div id="checkin_tab" className="space-y-6 max-w-xl mx-auto">
                <div>
                  <h2 className={`text-2xl font-bold tracking-tight ${stealthActive ? "font-sans text-gray-900" : "font-serif text-amber-900"}`}>
                    {stealthActive ? "Log Study Status" : "Log Sovereignty Audit"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {stealthActive ? "Record log metrics and hourly study output schedules." : "Map high friction points and secure reclaimed success minutes in real-time."}
                  </p>
                </div>

                <form onSubmit={handleSubmitCheckin} className="space-y-5 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm font-sans">
                  
                  {/* Slider 1: Stress Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-bold uppercase tracking-wider">Stress / Friction Intensity</span>
                      <span className={`font-mono font-bold ${stressLevel > 70 ? "text-rose-500" : "text-gray-700"}`}>
                        {stressLevel}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stressLevel}
                      onChange={(e) => setStressLevel(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#E28E75]"
                    />
                    <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                      <span>0% PEACE</span>
                      <span>50% STABLE</span>
                      <span className="text-rose-400 font-bold">100% OVERWHELMED</span>
                    </div>
                  </div>

                  {/* Button Select: Friction Source */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Core Friction Source</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Heavy family chores",
                        "Loud street noise/Gen",
                        "Relatives unexpected stay",
                        "Power and tech cutoffs",
                        "Kitchen duty overstep",
                        "Family social pressure"
                      ].map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setFrictionSource(src)}
                          className={`py-2 px-3 text-left rounded-xl text-xs font-sans transition-all border cursor-pointer ${
                            frictionSource === src
                              ? "border-[#E28E75] bg-orange-50/50 text-amber-900 font-medium"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {src}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slider 2: Hours Reclaimed */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-bold uppercase tracking-wide">Hours Reclaimed From Friction</span>
                      <span className="font-mono font-bold text-gray-700">{hoursReclaimed} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.5"
                      value={hoursReclaimed}
                      onChange={(e) => setHoursReclaimed(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#E28E75]"
                    />
                  </div>

                  {/* Journal Note */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {stealthActive ? "Schedule Comments" : "Sovereignty Diary entry"}
                    </label>
                    <textarea
                      placeholder="What specific boundary did you protect? How did you claim these minutes?"
                      value={journalNotes}
                      onChange={(e) => setJournalNotes(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-orange-100 focus:outline-none h-20 text-gray-700 font-serif"
                      style={{ fontFamily: stealthActive ? 'Inter' : 'Lora' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all ${
                      stealthActive ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-900 hover:bg-amber-950"
                    }`}
                  >
                    {stealthActive ? "Log Scheduled Task" : "Log Sovereignty Audit"}
                  </button>
                </form>
              </div>
            )}

            {/* View Checklist */}
            {activeTab === "tasks" && (
              <div id="tasks_tab" className="space-y-6 max-w-xl mx-auto">
                <div>
                  <h2 className={`text-2xl font-bold tracking-tight ${stealthActive ? "font-sans text-gray-900" : "font-serif text-amber-900"}`}>
                    {stealthActive ? "Task Syllabus" : "Sovereignty Success Checklist"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {stealthActive ? "Establish task syllabi and milestone checklists." : "Define protective tasks across academics, boundaries, and career targets."}
                  </p>
                </div>

                {/* Add new task */}
                <form onSubmit={handleAddTask} className="flex gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm font-sans">
                  <input
                    type="text"
                    required
                    maxLength={70}
                    placeholder="Lock study block, apply for scholarship..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-gray-100 focus:outline-none rounded-lg focus:ring-1 focus:ring-orange-200"
                  />
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="text-xs bg-gray-50 border border-gray-100 px-2 rounded-lg text-gray-500 font-sans focus:outline-none"
                  >
                    <option value="Academics">Academics</option>
                    <option value="Career Prep">Career Prep</option>
                    <option value="Personal Boundaries">Boundaries</option>
                    <option value="Life Admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    className={`px-3 py-2 rounded-lg text-xs font-bold text-white flex items-center justify-center cursor-pointer ${
                      stealthActive ? "bg-blue-600" : "bg-amber-900"
                    }`}
                  >
                    <Plus size={14} />
                  </button>
                </form>

                {/* Task category display lists */}
                <div className="space-y-4">
                  {(['Academics', 'Career Prep', 'Personal Boundaries', 'Life Admin'] as const).map((cat) => {
                    const groupTasks = tasks.filter(t => t.category === cat);
                    return (
                      <div key={cat} className="space-y-2">
                        <h4 className={`text-[10px] uppercase font-bold tracking-widest ${stealthActive ? "text-gray-500" : "text-amber-800"}`}>
                          {stealthActive && cat === "Personal Boundaries" ? "Schedule Allocations" : cat}
                        </h4>
                        
                        {groupTasks.length === 0 ? (
                          <p className="text-[10px] text-gray-400 italic pl-1">No active priorities in this category.</p>
                        ) : (
                          <div className="space-y-2 font-sans">
                            {groupTasks.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => handleToggleTask(t.id)}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  t.completed 
                                    ? "bg-gray-50/50 border-gray-100 opacity-60 line-through text-gray-400" 
                                    : "bg-white border-gray-100 hover:shadow-xs"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                    t.completed 
                                      ? (stealthActive ? "bg-blue-600 border-blue-600" : "bg-[#E28E75] border-[#E28E75]") 
                                      : "border-gray-200"
                                  }`}>
                                    {t.completed && <Check size={10} className="text-white" />}
                                  </div>
                                  <span className="text-xs text-gray-700 leading-normal">{t.title}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View Rehearse (Conversational Playground) */}
            {activeTab === "rehearse" && (
              <RehearsePlayground 
                user={currentUser} 
                stealthActive={stealthActive} 
                onSessionComplete={handleRehearseCallback} 
              />
            )}

            {/* View Calm Guided Breathing (Feature 6) */}
            {activeTab === "calm" && (
              <div id="calm_section" className="space-y-6 max-w-5xl mx-auto">
                <div className="border-b border-[#EDE8E0] pb-4">
                  <h2 className={`text-2xl font-bold tracking-tight ${stealthActive ? "font-sans text-gray-900" : "font-serif text-amber-900"}`}>
                    {stealthActive ? "Academic Calm Zone" : "Therapeutic Coping & Calm Zone"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {stealthActive ? "Self-regulated breathing breaks, pacing timers, and assertive communication scripts." : "Quiet physical and psychological sanctuary. Decompress, reframe anxiety, regulate breath, and build boundaries."}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Diaphragmatic Loop */}
                  <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                    <div className="p-8 bg-white border border-[#EDE8E0] shadow-xs rounded-xl flex flex-col items-center justify-center min-h-[320px] text-center space-y-6">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Breathing Pacing Ring</span>
                      
                      {/* Dynamic pacing circle */}
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        <div className={`absolute inset-0 rounded-full bg-opacity-20 flex items-center justify-center border transition-all duration-1000 ${
                          breathPhase === 'idle' ? "bg-gray-100 border-gray-200 scale-90" :
                          breathPhase === 'inhale' ? "bg-green-100 border-green-300 scale-110 animate-pulse" :
                          breathPhase === 'hold' ? "bg-yellow-105 border-yellow-300 scale-115" :
                          "bg-[#fedbd0] border-[#E28E75] scale-95"
                        }`}>
                          <div className="text-center font-sans">
                            <span className="text-3xl font-extrabold text-gray-800 tracking-tight block">
                              {breathPhase === 'idle' ? "—" : breathTimer}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1 block">
                              {breathPhase === 'idle' ? "READY" : breathPhase}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 max-w-xs font-sans">
                        <p className="text-xs text-gray-500 leading-relaxed font-sans">
                          {breathPhase === 'idle' && "Press trigger to start the 4s Inhale, 7s Hold, 8s Exhale diaphragmatic pacing loop."}
                          {breathPhase === 'inhale' && "Breathe in deeply through your nose, expanding your stomach."}
                          {breathPhase === 'hold' && "Hold the breath quietly. Anchor your cognitive center."}
                          {breathPhase === 'exhale' && "Exhale slowly through parting lips. Purge all local friction noise."}
                        </p>
                        
                        {breathPhase === 'idle' ? (
                          <button
                            onClick={startBreathing}
                            className={`px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-sm cursor-pointer transition-all ${
                              stealthActive ? "bg-blue-600" : "bg-[#7C2D3E] hover:bg-[#60202e]"
                            }`}
                          >
                            Start Diaphragmatic Loop
                          </button>
                        ) : (
                          <button
                            onClick={stopBreathing}
                            className="px-6 py-2.5 rounded-full text-xs font-bold text-gray-400 bg-gray-50 border hover:bg-gray-100 cursor-pointer transition-all"
                          >
                            Stop Timer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Continuous micro-affirmation spinning below breath pacing circle */}
                    <div className="p-4 bg-orange-50/20 border border-orange-100/40 rounded-xl leading-relaxed text-xs text-gray-600 font-serif italic text-center">
                      "{getAffirmation()}"
                    </div>
                  </div>

                  {/* Right Column: Therapeutic Coping Suite */}
                  <div className="lg:col-span-12 xl:col-span-7">
                    {currentUser && (
                      <TherapeuticCopingSuite userId={currentUser.uid} stealthActive={stealthActive} />
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* View Trends (Analytics) */}
            {activeTab === "trends" && (
              <div id="trends_section" className="space-y-6 max-w-4xl mx-auto">
                <div>
                  <h2 className={`text-2xl font-bold tracking-tight ${stealthActive ? "font-sans text-gray-900" : "font-serif text-amber-900"}`}>
                    {stealthActive ? "Weekly Progress Statistics" : "Sovereignty Patterns & Trends"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {stealthActive ? "Historical productivity consistency and completion indices." : "Track stress pattern metrics and understand recurring local household friction triggers."}
                  </p>
                </div>

                {/* Analytical cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm font-sans">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Historical Diagnostics</h3>
                    <div className="p-4 rounded-xl bg-orange-50/30 border border-orange-50 space-y-3">
                      <div className="flex justify-between items-baseline border-b border-orange-100/30 pb-2">
                        <span className="text-xs text-gray-500">Most common friction trigger</span>
                        <span className="text-xs font-bold text-amber-950 font-sans">Chores expected & noise</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-orange-100/30 pb-2">
                        <span className="text-xs text-gray-500">Weekly baseline stress average</span>
                        <span className="text-xs font-bold text-amber-950 font-sans">42% (Normal margin)</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-gray-500">Total success minutes locked</span>
                        <span className="text-xs font-bold text-amber-950 font-sans">1,280 minutes</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 flex flex-col justify-center">
                    <h3 className="text-sm font-bold tracking-tight text-gray-800">Your Sovereignty compounds when metrics emerge</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-sans">
                      Logging regular checks helps clarify times and intervals that are historically optimal. Switch to the <strong>Score</strong> or <strong>Predict</strong> tabs to map the full chronological history curves and pro-active tomorrow models.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* View Sovereignty Score (Feature 2) */}
            {activeTab === "score" && (
              <SovereigntyScoreView userId={currentUser.uid} stealthActive={stealthActive} />
            )}

            {/* View Weekly Sovereignty Report (Feature 3) */}
            {activeTab === "report" && (
              <WeeklyReportView user={currentUser} stealthActive={stealthActive} />
            )}

            {/* View Safe Circles (Feature 4) */}
            {activeTab === "circles" && (
              <SafeCirclesView user={currentUser} stealthActive={stealthActive} />
            )}

            {/* View Pattern Predictions (Feature 5) */}
            {activeTab === "predict" && (
              <PatternPredictionView user={currentUser} stealthActive={stealthActive} />
            )}

            {/* View Journal (New) */}
            {activeTab === "journal" && (
              <HeyvinJournalView userId={currentUser.uid} stealthActive={stealthActive} />
            )}

            {/* View Friction Map (New) */}
            {activeTab === "heatmap" && (
              <FrictionHeatmapView userId={currentUser.uid} stealthActive={stealthActive} />
            )}

            {/* View Emergency Focus Lock Takeover */}
            {activeTab === "focus" && (
              <FocusLockView
                userId={currentUser.uid}
                stealthActive={stealthActive}
                onExit={() => setActiveTab("today")}
                onSignOut={handleSignOut}
              />
            )}

            {/* View Sovereign Settings */}
            {activeTab === "settings" && currentUser && (
              <SovereignSettingsView
                user={currentUser}
                onUpdateUser={(updated) => {
                  setCurrentUser(updated);
                  db.updateUserProfile(updated);
                }}
                stealthActive={stealthActive}
              />
            )}

          </main>

          {/* Mobile Bottom Navigation Bar (Flawless mobile layout) */}
          <footer className={`fixed bottom-0 left-0 w-full p-2 z-20 md:hidden flex justify-around items-center border-t backdrop-blur-md bg-white/95 ${
            stealthActive ? "border-gray-200" : "border-[#EDE8E0]"
          }`}>
            {[
              { id: "today", icon: Calendar, label: "Today", stealth: "Planner" },
              { id: "tasks", icon: Check, label: "Tasks", stealth: "To-Do" },
              { id: "rehearse", icon: Brain, label: "Rehearse", stealth: "Notes" },
              { id: "calm", icon: Heart, label: "Calm", stealth: "Break" },
              { id: "score", icon: Crown, label: "Score", stealth: "Grades" }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              
              let activeStyle = active 
                ? "text-[#7C2D3E] font-extrabold" 
                : "text-[#7A6860] hover:text-[#1A1414]";
                
              if (stealthActive) {
                activeStyle = active 
                  ? "text-blue-600 font-extrabold" 
                  : "text-gray-400 hover:text-gray-600";
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${activeStyle}`}
                >
                  <Icon size={18} />
                  <span className="text-[8px] uppercase tracking-wider font-extrabold mt-1">
                    {stealthActive ? tab.stealth : tab.label}
                  </span>
                </button>
              );
            })}
            
            {/* Slide-up trigger for more */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col items-center justify-center p-1 text-[#7A6860] hover:text-[#1A1414]"
            >
              <Menu size={18} />
              <span className="text-[8px] uppercase tracking-wider font-extrabold mt-1">More</span>
            </button>
          </footer>

        </div>
      )}

    </div>
  );
}
