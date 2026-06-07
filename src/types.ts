export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  location: 'Lagos' | 'Delhi' | 'Mexico' | 'Other';
  based_in: 'Nigeria' | 'India' | 'Mexico' | 'Other';
  home_situation: 'Living with parents' | 'Partner' | 'In-laws' | 'Siblings' | 'Other';
  primary_goal: 'University degree' | 'Career growth' | 'Starting a business';
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  day_of_week: number; // 0-6 (Sunday-Saturday)
  hour_of_day: number; // 0-23
  stress_level: number; // 0-100
  friction_source: string; // e.g., "Family chores", "Generator noise", "Relatives visit", "Power outage"
  hours_reclaimed: number;
  notes?: string;
  created_at: string;
}

export interface SovereigntyScore {
  id: string;
  user_id: string;
  week_start: string; // YYYY-MM-DD
  score: number; // 0-100
  consistency: number; // component score (e.g., 0-25)
  protection: number; // component score (e.g., 0-30)
  resilience: number; // component score (e.g., 0-25)
  growth: number; // component score (e.g., 0-20)
  created_at: string;
}

export interface WeeklyReport {
  id: string;
  user_id: string;
  week_start: string;
  report_text: string;
  score: number;
  hours_reclaimed: number;
  created_at: string;
}

export interface CircleMember {
  id: string;
  user_id: string;
  member_user_id: string;
  name: string;
  initials: string;
  location: string;
  score: number;
  join_date: string;
  color_ring: string; // css color or level
}

export interface CircleInvite {
  id: string;
  user_id: string;
  from_user_id: string;
  to_email: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface CircleNudge {
  id: string;
  from_user_id: string;
  to_user_id: string;
  seen: boolean;
  created_at: string;
}

export interface CircleActivity {
  id: string;
  user_id: string;
  username: string;
  activity_type: 'check_in' | 'rehearse' | 'tasks' | 'calm' | 'score_up';
  anonymized_label: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  category: 'Academics' | 'Career Prep' | 'Personal Boundaries' | 'Life Admin';
  completed: boolean;
  hours_estimate: number;
  created_at: string;
}

export interface RehearseSession {
  id: string;
  user_id: string;
  topic: string;
  situation: string;
  transcript: string[];
  analyzed_response: string;
  created_at: string;
}
