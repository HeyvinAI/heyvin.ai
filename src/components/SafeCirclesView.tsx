import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Mail, Compass, HelpCircle, Heart, PlusCircle, CheckCircle, Lock, ShieldAlert } from "lucide-react";
import { CircleMember, CircleInvite, CircleActivity, UserProfile } from "../types";
import { db } from "../lib/supabase";

interface SafeCirclesViewProps {
  user: UserProfile;
  stealthActive: boolean;
}

export default function SafeCirclesView({ user, stealthActive }: SafeCirclesViewProps) {
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [invites, setInvites] = useState<CircleInvite[]>([]);
  const [activities, setActivities] = useState<CircleActivity[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("I'm using Heyvin AI to protect my focus time. Join my Safe Circle — I'd love to have someone in my corner.");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadCircleData();
  }, [user.uid]);

  const loadCircleData = () => {
    setMembers(db.get<CircleMember>(user.uid, "circle_members"));
    setInvites(db.get<CircleInvite>(user.uid, "circle_invites"));
    setActivities(db.get<CircleActivity>(user.uid, "circle_activity"));
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newInvite: CircleInvite = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: user.uid,
      from_user_id: user.uid,
      to_email: inviteEmail,
      message: inviteMsg,
      status: "pending",
      created_at: new Date().toISOString()
    };

    // Save to DB via mock clients
    db.upsert(user.uid, "circle_invites", newInvite);
    
    // Add pending activity log to feed
    const inviteName = inviteEmail.split("@")[0];
    const newAct: CircleActivity = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: user.uid,
      username: user.username,
      activity_type: "tasks",
      anonymized_label: `Sent invite to ${inviteName} to join Safe Circle 👥`,
      created_at: new Date().toISOString()
    };
    
    const currActs = db.get<CircleActivity>(user.uid, "circle_activity");
    currActs.unshift(newAct);
    db.save(user.uid, "circle_activity", currActs);

    setInviteEmail("");
    setShowInviteModal(false);
    loadCircleData();
    showToast("Invite sent. When they join Heyvin, they'll appear in your circle.");
  };

  const handleSendNudge = (member: CircleMember) => {
    // Register nudge
    const mockNudge = {
      id: Math.random().toString(36).substr(2, 9),
      from_user_id: user.uid,
      to_user_id: member.member_user_id,
      seen: false,
      created_at: new Date().toISOString()
    };

    const nudges = db.get<any>(user.uid, "circle_nudges");
    nudges.push(mockNudge);
    db.save(user.uid, "circle_nudges", nudges);

    showToast(`Quiet nudge sent. ${member.name} will be notified privately.`);
  };

  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div id="safe_circles_container" className="space-y-6 max-w-4xl mx-auto relative">
      {/* Toast alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl text-xs font-semibold shadow-xl border flex items-center gap-2 ${
              stealthActive 
                ? "bg-blue-600 text-white border-blue-500" 
                : "bg-amber-950 text-orange-50 border-orange-950/20"
            }`}
          >
            <CheckCircle size={14} />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div>
        <h2 className={`text-2xl font-bold tracking-tight ${stealthActive ? "font-sans text-gray-900" : "font-serif text-amber-900"}`}>
          {stealthActive ? "Peer Research Groups" : "Safe Circles"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {stealthActive ? "Establish quiet academic support networks. Share research grades anonymously." : "A private, encrypted peer support network — invite up to 3 trusted sisters who see only what you choose to show."}
        </p>
      </div>

      {/* Circle Members (Max 3 slots grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Render actual slots */}
        {[0, 1, 2].map((slotIdx) => {
          const m = members[slotIdx];
          
          if (m) {
            // Calculated dash math for small circle rings (radius 20, circumference ~125.6)
            const cirR = 20;
            const cirCirc = 2 * Math.PI * cirR;
            const offsetAmt = cirCirc - (m.score / 100) * cirCirc;

            return (
              <div 
                key={m.id}
                className={`p-6 rounded-2xl border text-center relative flex flex-col items-center justify-between min-h-[190px] transition-all bg-white shadow-sm ${
                  stealthActive ? "border-gray-200" : "border-orange-100/60"
                }`}
              >
                {/* SVG Ring for Sovereignty Score display of other circle members */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r={cirR} className="fill-none stroke-gray-50" strokeWidth="4" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r={cirR} 
                      className="fill-none" 
                      stroke={stealthActive ? "#2563EB" : m.color_ring} 
                      strokeWidth="4" 
                      strokeDasharray={cirCirc}
                      strokeDashoffset={offsetAmt}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute font-serif text-amber-950 font-bold text-xs" style={{ fontFamily: stealthActive ? 'Inter' : 'Lora' }}>
                    {m.score}
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-gray-800">{m.name}</h4>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">{m.location} · Joined {m.join_date}</p>
                </div>

                {/* Quiet nudge 💜 */}
                <button
                  type="button"
                  onClick={() => handleSendNudge(m)}
                  className={`mt-4 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer border ${
                    stealthActive 
                      ? "border-blue-100 text-blue-700 bg-blue-50/50 hover:bg-blue-50" 
                      : "border-orange-100 text-[#E28E75] bg-orange-50/40 hover:bg-orange-50/80"
                  }`}
                >
                  <Heart size={10} fill={stealthActive ? "none" : "#E28E75"} />
                  {stealthActive ? "Send Alert" : "Send Nudge"}
                </button>
              </div>
            );
          }

          // Check if slotIdx matches any pending invites
          const pendingInvite = invites[slotIdx - members.length];
          if (pendingInvite) {
            const shortName = pendingInvite.to_email.split("@")[0];
            return (
              <div 
                key={pendingInvite.id}
                className="p-6 rounded-2xl border text-center border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center min-h-[190px]"
              >
                <Mail size={24} className="text-gray-300 animate-pulse mb-3" />
                <h4 className="text-xs font-bold text-gray-500 truncate max-w-full px-2">{shortName}</h4>
                <span className="text-[9px] uppercase font-bold text-amber-700 tracking-wider bg-orange-100 px-2 py-0.5 rounded-full mt-2 animate-pulse">
                  Invite Pending
                </span>
                <p className="text-[10px] text-gray-400 mt-2">Waiting for invitation acceptance</p>
              </div>
            );
          }

          // Otherwise return empty slot
          return (
            <div 
              key={`empty-${slotIdx}`}
              onClick={() => setShowInviteModal(true)}
              className="p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30 font-sans hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[190px] group text-center"
            >
              <PlusCircle size={24} className="text-gray-300 group-hover:text-gray-400 group-hover:scale-105 transition-all" />
              <span className="text-xs font-bold text-gray-500 mt-3 group-hover:text-gray-700">Invite Circle Member</span>
              <p className="text-[10px] text-gray-400 mt-1">Empty support slot</p>
            </div>
          );
        })}
      </div>

      {/* Circle Activity Feed */}
      <div className={`p-6 rounded-2xl border ${stealthActive ? "bg-white border-gray-200" : "bg-[#FEFAF6]/40 border-orange-100/50"}`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${stealthActive ? "text-gray-500" : "text-amber-800"}`}>
          {stealthActive ? "Academic Group Log" : "Private Circles Activity Feed"}
        </h3>
        
        {activities.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Invited members' anonymized logs will manifest here.</p>
        ) : (
          <div className="space-y-3 font-sans">
            {activities.map((act) => (
              <div 
                key={act.id} 
                className={`py-2 px-3 text-xs rounded-xl flex justify-between items-center bg-white border ${
                  stealthActive ? "border-gray-50" : "border-orange-50/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${stealthActive ? "bg-blue-600" : "bg-[#E28E75]"}`} />
                  <span className="text-gray-700 leading-relaxed font-sans">{act.anonymized_label}</span>
                </div>
                <span className="text-[9px] text-gray-400 font-mono">
                  {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice Disclaimer */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex gap-3 text-xs leading-relaxed text-gray-500">
        <Lock size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Heyvin Cryptographic Privacy Architecture:</strong> Your circle members explicitly view only your weekly aggregate Sovereignty Score (numeric indicator) and broad mood signposts in their feed. Your journals, checklist notes, homework categories, and voice rehearsals exist exclusively safe and locked on your local device — never exposed to external views.
        </p>
      </div>

      {/* Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-orange-50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <Users size={14} /> Invite trusted ally
              </span>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs"
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Recipient Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ally@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 text-xs text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider text-gray-400">Pre-compiled Message Box</label>
                <textarea
                  value={inviteMsg}
                  onChange={(e) => setInviteMsg(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs leading-relaxed h-24 focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-amber-900 cursor-pointer hover:bg-amber-950 transition-all shadow-sm"
              >
                Send Secure Invitation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
