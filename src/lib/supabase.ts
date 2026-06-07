import { CheckIn, SovereigntyScore, WeeklyReport, CircleMember, CircleInvite, CircleNudge, CircleActivity, Task, RehearseSession, UserProfile } from "../types";

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

  // Save all to localStorage
  localStorage.setItem(getStorageKey(user_id, "tasks"), JSON.stringify(initialTasks));
  localStorage.setItem(getStorageKey(user_id, "check_ins"), JSON.stringify(initialCheckIns));
  localStorage.setItem(getStorageKey(user_id, "circle_members"), JSON.stringify(initialCircle));
  localStorage.setItem(getStorageKey(user_id, "circle_invites"), JSON.stringify(initialInvites));
  localStorage.setItem(getStorageKey(user_id, "circle_activity"), JSON.stringify(initialActivity));
  localStorage.setItem(getStorageKey(user_id, "sovereignty_scores"), JSON.stringify(initialScores));
  localStorage.setItem(getStorageKey(user_id, "weekly_reports"), JSON.stringify([]));
  localStorage.setItem(getStorageKey(user_id, "circle_nudges"), JSON.stringify([]));
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
    return item;
  },

  // Delete record
  delete: <T extends { id: string }>(user_id: string, table: string, id: string) => {
    const list = db.get<T>(user_id, table);
    const filtered = list.filter(item => item.id !== id);
    db.save(user_id, table, filtered);
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
    const tables = ["tasks", "check_ins", "sovereignty_scores", "weekly_reports", "circle_members", "circle_invites", "circle_nudges", "circle_activities", "rehearse_sessions", "journals"];
    tables.forEach(table => {
      localStorage.removeItem(`heyvin_${user_id}_table_${table}`);
    });
  },

  updateUserProfile: (user: UserProfile) => {
    localStorage.setItem("heyvin_current_user", JSON.stringify(user));
  }
};
