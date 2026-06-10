import { CheckIn, SovereigntyScore, WeeklyReport, CircleMember, CircleInvite, CircleNudge, CircleActivity, Task, RehearseSession, UserProfile } from "../types";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client if keys are set, otherwise fallback to local execution
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }) 
  : null;

if (supabase) {
  console.log("⚡ [Supabase init] Secure remote connection established successfully.");
} else {
  console.log("📦 [Supabase custom init] running in local mock state.");
}

// Helper to generate UUIDs
function uuid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Check if user is logged in
export function getActiveUser(): UserProfile | null {
  const userStr = localStorage.getItem("heyvin_current_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// User-specific data keying
function getStorageKey(user_id: string, table: string) {
  return `heyvin_${user_id}_table_${table}`;
}

// Silent Auth on startup or signup to ensure RLS policies work out of the box
export async function authenticateSupabase(uid: string) {
  if (!supabase) return;
  const email = `${uid}@heyvin.internal`;
  const password = `Password_${uid}_Secure123!`;
  
  try {
    // 1. Try signing in
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Invalid login credentials") || error.message.includes("User not found")) {
        // 2. Try signing up if account doesn't exist yet
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          console.warn("[Supabase Auth] Background password registration warning:", signUpError.message);
        } else {
          console.log("⚡ [Supabase Auth] New silent account registered for security.");
        }
      } else {
        console.warn("[Supabase Auth] Background authentication error:", error.message);
      }
    } else {
      console.log("⚡ [Supabase Auth] Silent session authenticated successfully.");
    }
  } catch (err: any) {
    console.error("[Supabase Auth ERROR] Silent login flow exception:", err.message || err);
  }
}

// Seed initial data for a newly created user or default user
export function seedUserData(user_id: string, country: 'Lagos' | 'Delhi' | 'Mexico' | 'Other') {
  // 1. Initial Tasks
  const initialTasks: Task[] = [
    {
      id: uuid(),
      user_id,
      title: country === 'Delhi' ? "Revise Machine Learning notes for competitive exam" : 
             country === 'Mexico' ? "Apply for Google Women Techmakers scholarship" : 
             "Apply for Lagos TechWomen Fellowship program",
      category: "Academics",
      completed: true,
      hours_estimate: 3,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: uuid(),
      user_id,
      title: "Talk to mom about locking door during 2-hour study blocks",
      category: "Personal Boundaries",
      completed: false,
      hours_estimate: 2,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: uuid(),
      user_id,
      title: country === 'Delhi' ? "Solve 10 algorithm problems on LeetCode" : 
             country === 'Mexico' ? "Build React props/state proof-of-concept project" :
             "Finish CSS positioning and grid assignments on FreeCodeCamp",
      category: "Academics",
      completed: false,
      hours_estimate: 4,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: uuid(),
      user_id,
      title: "Set up LinkedIn portfolio with clean biography",
      category: "Career Prep",
      completed: true,
      hours_estimate: 1,
      created_at: new Date(Date.now() - 6 * 86400000).toISOString()
    }
  ];

  // 2. Initial Completed Check-ins (7 check-ins over last week so predicting/stats are instantly unlocked!)
  const sources = country === 'Delhi' ? ["Extended family duties", "Loud street vendors", "Power trip", "Noisy cousins visit"] :
                  country === 'Mexico' ? ["Domestic chores", "Street traffic noise", "Brother's music", "Unexpected visitors"] :
                  ["Heavy family chores", "High generator fumes/noise", "Power grid off", "Unannounced relatives"];
  
  const initialCheckIns: CheckIn[] = [
    {
      id: uuid(),
      user_id,
      date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
      day_of_week: new Date(Date.now() - 6 * 86400000).getDay(),
      hour_of_day: 7, // 7am
      stress_level: 20,
      friction_source: "None - Early Morning Sweet Spot",
      hours_reclaimed: 3.5,
      notes: "Woke up before everyone else. Incredible focus while house was entirely asleep.",
      created_at: new Date(Date.now() - 6 * 86400000).toISOString()
    },
    {
      id: uuid(),
      user_id,
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      day_of_week: new Date(Date.now() - 5 * 86400000).getDay(),
      hour_of_day: 18, // 6pm
      stress_level: 80,
      friction_source: sources[0], // Family chores
      hours_reclaimed: 0.5,
      notes: "Supper duty and kitchen noise made studying theory impossible. Did micro-flashcards on phone instead.",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: uuid(),
      user_id,
      date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      day_of_week: new Date(Date.now() - 4 * 86400000).getDay(),
      hour_of_day: 10,
      stress_level: 45,
      friction_source: sources[1], // noisy generator / street traffic
      hours_reclaimed: 2.0,
      notes: "Put on active noise-canceling headphones to code while the outside chatter surged.",
      created_at: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: uuid(),
      user_id,
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      day_of_week: new Date(Date.now() - 3 * 86400000).getDay(),
      hour_of_day: 14,
      stress_level: 30,
      friction_source: "None - Headed to library",
      hours_reclaimed: 3.0,
      notes: "Physically escaped the household friction by studying at the public resource library.",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: uuid(),
      user_id,
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      day_of_week: new Date(Date.now() - 2 * 86400000).getDay(),
      hour_of_day: 20, // 8pm
      stress_level: 75,
      friction_source: sources[2], // Power outages/brother music
      hours_reclaimed: 1.0,
      notes: "Friction was overwhelming. Stepped outside with a printed chapter to read under the light.",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: uuid(),
      user_id,
      date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      day_of_week: new Date(Date.now() - 1 * 86400000).getDay(),
      hour_of_day: 9,
      stress_level: 60,
      friction_source: sources[3], // Relatives
      hours_reclaimed: 1.5,
      notes: "Sudden home visits forced me to join conversations. Reclaimed 1.5 hours in bedroom by saying I had homework exam due.",
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: uuid(),
      user_id,
      date: new Date().toISOString().split('T')[0],
      day_of_week: new Date().getDay(),
      hour_of_day: 8,
      stress_level: 25,
      friction_source: "None - Morning study chunk",
      hours_reclaimed: 2.5,
      notes: "Sovereignty protected today! Completed 2.5 hours of focus code before any requests.",
      created_at: new Date().toISOString()
    }
  ];

  // 3. Circle members (Maya, Priya) and 1 slots
  const initialCircle: CircleMember[] = [
    {
      id: uuid(),
      user_id,
      member_user_id: "m_maya_99",
      name: country === 'Mexico' ? "Sofia" : country === 'Delhi' ? "Anjali" : "Maya",
      initials: country === 'Mexico' ? "S" : country === 'Delhi' ? "A" : "M",
      location: country === 'Mexico' ? "Guadalajara" : country === 'Delhi' ? "Mumbai" : "Lagos",
      score: 83,
      join_date: "2026-04-12",
      color_ring: "#E28E75" // Terracotta theme
    },
    {
      id: uuid(),
      user_id,
      member_user_id: "p_priya_22",
      name: country === 'Mexico' ? "Mariana" : country === 'Delhi' ? "Priya" : "Kemi",
      initials: country === 'Mexico' ? "M" : country === 'Delhi' ? "P" : "K",
      location: country === 'Mexico' ? "Monterrey" : country === 'Delhi' ? "Delhi" : "Ibadan",
      score: 64,
      join_date: "2026-05-01",
      color_ring: "#EDB870" // Gold Theme
    }
  ];

  const initialInvites: CircleInvite[] = [];

  // 4. Circle Activity
  const initialActivity: CircleActivity[] = [
    {
      id: uuid(),
      user_id: "m_maya_99",
      username: country === 'Mexico' ? "Sofia" : country === 'Delhi' ? "Anjali" : "Maya",
      activity_type: "rehearse",
      anonymized_label: `${country === 'Mexico' ? "Sofia" : country === 'Delhi' ? "Anjali" : "Maya"} completed a Rehearse session 💬`,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: uuid(),
      user_id: "p_priya_22",
      username: country === 'Mexico' ? "Mariana" : country === 'Delhi' ? "Priya" : "Kemi",
      activity_type: "score_up",
      anonymized_label: `${country === 'Mexico' ? "Mariana" : country === 'Delhi' ? "Priya" : "Kemi"}'s sovereignty score rose 12 points 📈`,
      created_at: new Date(Date.now() - 14 * 3600000).toISOString()
    },
    {
      id: uuid(),
      user_id: "m_maya_99",
      username: country === 'Mexico' ? "Sofia" : country === 'Delhi' ? "Anjali" : "Maya",
      activity_type: "calm",
      anonymized_label: `${country === 'Mexico' ? "Sofia" : country === 'Delhi' ? "Anjali" : "Maya"} had a calm week 🌿`,
      created_at: new Date(Date.now() - 36 * 3600000).toISOString()
    }
  ];

  // 5. Stored scores historical (last 8 weeks) to populate Sovereignty Score Line Chart
  const weekStarts = [
    "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"
  ];
  const historicalScores = [55, 58, 62, 60, 68, 75, 71, 78];
  
  const initialScores: SovereigntyScore[] = weekStarts.map((week, idx) => ({
    id: uuid(),
    user_id,
    week_start: week,
    score: historicalScores[idx],
    consistency: Math.min(25, Math.floor(historicalScores[idx] * 0.25)),
    protection: Math.min(30, Math.floor(historicalScores[idx] * 0.3)),
    resilience: Math.min(25, Math.floor(historicalScores[idx] * 0.25)),
    growth: Math.min(20, Math.floor(historicalScores[idx] * 0.2)),
    created_at: new Date(Date.now() - (8 - idx) * 7 * 86400000).toISOString()
  }));

  // Save all to localStorage via db.save so they dual-write directly to cloud Supabase instantly
  db.save(user_id, "tasks", initialTasks);
  db.save(user_id, "check_ins", initialCheckIns);
  db.save(user_id, "circle_members", initialCircle);
  db.save(user_id, "circle_invites", initialInvites);
  db.save(user_id, "circle_activity", initialActivity);
  db.save(user_id, "sovereignty_scores", initialScores);
  db.save(user_id, "weekly_reports", []);
  db.save(user_id, "circle_nudges", []);
  db.save(user_id, "journal_entries", []);
}

// Database helper functions wrapped in a simulated "supabase" service
export const db = {
  // Query tables
  get: <T>(user_id: string, table: string): T[] => {
    const key = getStorageKey(user_id, table);
    const dataStr = localStorage.getItem(key);
    if (!dataStr) return [];
    try {
      return JSON.parse(dataStr);
    } catch {
      return [];
    }
  },

  // Save full tables
  save: <T>(user_id: string, table: string, items: T[]) => {
    const key = getStorageKey(user_id, table);
    localStorage.setItem(key, JSON.stringify(items));
    
    // Trigger window storage event for reactive updates (since we're SPA-based)
    window.dispatchEvent(new Event('heyvin_db_update'));

    // Dual-write to cloud Supabase if active
    if (supabase) {
      const dbTable = (table === "journals" || table === "journal_entries") ? "journal_entries" : table;
      supabase.from(dbTable).delete().eq('user_id', user_id).then(({ error: deleteError }) => {
        if (deleteError) {
          console.warn(`[Supabase delete error] bulk save on '${dbTable}':`, deleteError.message);
        }
        if (items.length > 0) {
          supabase.from(dbTable).insert(items as any).then(({ error: insertError }) => {
            if (insertError) console.error(`[Supabase error] Bulk insert to '${dbTable}':`, insertError);
          });
        }
      });
    }
  },

  // Insert or Update single record
  upsert: <T extends { id: string; user_id: string }>(user_id: string, table: string, item: T) => {
    const list = db.get<T>(user_id, table);
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    db.save(user_id, table, list);

    if (supabase) {
      const dbTable = (table === "journals" || table === "journal_entries") ? "journal_entries" : table;
      supabase.from(dbTable).upsert(item as any).then(({ error }) => {
        if (error) console.error(`[Supabase error] Upsert to '${dbTable}':`, error);
      });
    }
    return item;
  },

  // Delete record
  delete: <T extends { id: string }>(user_id: string, table: string, id: string) => {
    const list = db.get<T>(user_id, table);
    const filtered = list.filter(item => item.id !== id);
    db.save(user_id, table, filtered);

    if (supabase) {
      const dbTable = (table === "journals" || table === "journal_entries") ? "journal_entries" : table;
      supabase.from(dbTable).delete().eq('id', id).then(({ error }) => {
        if (error) console.error(`[Supabase error] Delete from '${dbTable}':`, error);
      });
    }
  },

  // Pull sync from cloud on login or boot
  syncFromCloud: async (user_id: string) => {
    if (!supabase) return;
    const tables = ["tasks", "check_ins", "sovereignty_scores", "weekly_reports", "circle_members", "circle_invites", "circle_nudges", "journal_entries"];
    try {
      // 1. Fetch User Profile remotely
      const { data: profileData, error: profileError } = await supabase.from("user_profiles").select("*").eq("uid", user_id).maybeSingle();
      if (!profileError && profileData) {
        localStorage.setItem("heyvin_current_user", JSON.stringify(profileData));
      }

      // 2. Fetch table collections
      for (const table of tables) {
        const dbTable = (table === "journals" || table === "journal_entries") ? "journal_entries" : table;
        const { data, error } = await supabase.from(dbTable).select("*").eq("user_id", user_id);
        if (error) {
          console.warn(`[Supabase Warning] Syncing '${dbTable}':`, error.message);
        } else if (data) {
          localStorage.setItem(getStorageKey(user_id, table), JSON.stringify(data));
        }
      }
      
      // Dispatch reactive updating notification
      window.dispatchEvent(new Event('heyvin_db_update'));
      console.log("🙌 [Supabase sync] Cloud pulled user sync completed successfully.");
    } catch (e: any) {
      console.error("[Supabase sync error] Sync routine failed:", e);
    }
  },

  // Calculate Sovereignty Score Based on Actual Check-Ins
  calculateSovereigntyScore: (user_id: string): SovereigntyScore => {
    const checkins = db.get<CheckIn>(user_id, "check_ins");
    
    // 1. Consistency Score (max 25)
    // Counts unique days checked in within last 7 days
    const uniqueDays = new Set<string>();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    checkins.forEach(c => {
      const cDate = new Date(c.date);
      if (cDate >= sevenDaysAgo) {
        uniqueDays.add(c.date);
      }
    });
    
    const loggedCount = uniqueDays.size;
    let consistency = 0;
    if (loggedCount >= 5) consistency = 25;
    else if (loggedCount === 4) consistency = 20;
    else if (loggedCount === 3) consistency = 15;
    else if (loggedCount === 2) consistency = 10;
    else if (loggedCount === 1) consistency = 5;

    // 2. Protection Score (max 30)
    // Formula: (Total hours reclaimed / target index)
    // Target is around 14 hours reclaimed a week (2 hours a day)
    let totalReclaimed = 0;
    checkins.forEach(c => {
      const cDate = new Date(c.date);
      if (cDate >= sevenDaysAgo) {
        totalReclaimed += Number(c.hours_reclaimed || 0);
      }
    });
    
    const protection = Math.min(30, Math.floor((totalReclaimed / 14) * 30));

    // 3. Resilience Score (max 25)
    // Friction events logging consistency (friction logged/handled ratio)
    // Derived from task completion rates + coping capacity
    const tasks = db.get<Task>(user_id, "tasks");
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskRatio = tasks.length > 0 ? (completedTasks / tasks.length) : 0.8;
    
    const highFrictionHandled = checkins.filter(c => c.stress_level > 60 && c.hours_reclaimed >= 1).length;
    const resilienceBase = Math.min(15, highFrictionHandled * 5) + Math.floor(taskRatio * 10);
    const resilience = Math.min(25, resilienceBase);

    // 4. Growth Score (max 20)
    // Trend vs previous weeks
    const historicalScores = db.get<SovereigntyScore>(user_id, "sovereignty_scores")
      .filter(s => s.week_start.startsWith("Week "))
      .sort((a,b) => b.created_at.localeCompare(a.created_at));
    
    let growth = 10; // baseline standard
    if (historicalScores.length > 0) {
      const lastScore = historicalScores[0].score;
      const currentRaw = consistency + protection + resilience;
      if (currentRaw > lastScore) {
        growth = 20; // significant improvement
      } else if (Math.abs(currentRaw - lastScore) <= 5) {
        growth = 15; // steady holding ground
      } else {
        growth = 5; // drop-off
      }
    } else {
      growth = 15;
    }

    const finalScore = consistency + protection + resilience + growth;

    const newScoreObject: SovereigntyScore = {
      id: uuid(),
      user_id,
      week_start: `Week ${historicalScores.length + 1}`,
      score: finalScore,
      consistency,
      protection,
      resilience,
      growth,
      created_at: new Date().toISOString()
    };

    return newScoreObject;
  },

  clearUserData: (user_id: string) => {
    const tables = ["tasks", "check_ins", "sovereignty_scores", "weekly_reports", "circle_members", "circle_invites", "circle_nudges", "circle_activities", "rehearse_sessions", "journal_entries"];
    tables.forEach(table => {
      localStorage.removeItem(`heyvin_${user_id}_table_${table}`);
    });
    
    if (supabase) {
      tables.forEach(table => {
        const dbTable = (table === "journals" || table === "journal_entries") ? "journal_entries" : table;
        supabase.from(dbTable).delete().eq("user_id", user_id).then(({ error }) => {
          if (error) console.error(`[Supabase remote clear error] ${dbTable}:`, error.message);
        });
      });
      supabase.from("user_profiles").delete().eq("uid", user_id).then(({ error }) => {
        if (error) console.error("[Supabase remote profile clear error] user_profiles:", error.message);
      });
    }
  },

  updateUserProfile: (user: UserProfile) => {
    localStorage.setItem("heyvin_current_user", JSON.stringify(user));
    if (supabase) {
      supabase.from("user_profiles").upsert({
        uid: user.uid,
        email: user.email,
        username: user.username,
        location: user.location,
        based_in: user.based_in,
        home_situation: user.home_situation,
        primary_goal: user.primary_goal,
        created_at: user.created_at
      }).then(({ error }) => {
        if (error) console.error("[Supabase error] Upserting user_profile failed:", error.message);
      });
    }
  }
};

// Save waitlist email signups
export async function saveWaitlistEmail(email: string): Promise<{ success: boolean; error?: string; source: "supabase" | "local" }> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Save to local storage as a robust backup
  try {
    const localWaitlistStr = localStorage.getItem("heyvin_local_waitlist") || "[]";
    const localWaitlist = JSON.parse(localWaitlistStr);
    if (!localWaitlist.includes(normalizedEmail)) {
      localWaitlist.push(normalizedEmail);
      localStorage.setItem("heyvin_local_waitlist", JSON.stringify(localWaitlist));
    }
  } catch (e) {
    console.warn("[Local waitlist save error]:", e);
  }

  // 2. Insert into Supabase table if remote client config exists
  if (supabase) {
    try {
      const { error } = await supabase
        .from("waitlist")
        .insert([{ email: normalizedEmail, created_at: new Date().toISOString() }]);
        
      if (error) {
        console.warn("[Supabase Waitlist notice] Attempted insert to 'waitlist' table in cloud. Error:", error.message);
        // We still return success: true because we have verified and saved to the local database backup
        return { success: true, error: error.message, source: "local" };
      }
      console.log("⚡ [Supabase Waitlist] Email successfully registered in cloud database.");
      return { success: true, source: "supabase" };
    } catch (err: any) {
      console.warn("[Supabase Waitlist Exception] Bypassed database error:", err.message || err);
      return { success: true, error: err.message || String(err), source: "local" };
    }
  }

  return { success: true, source: "local" };
}

