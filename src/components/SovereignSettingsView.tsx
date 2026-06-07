import React, { useState } from "react";
import { 
  User, Mail, MapPin, Home, Target, Shield, RefreshCw, Trash2, 
  Eye, EyeOff, Save, Check, Key, Smartphone, AlertTriangle 
} from "lucide-react";
import { UserProfile } from "../types";
import { db } from "../lib/supabase";

interface SovereignSettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  stealthActive: boolean;
}

export function SovereignSettingsView({ user, onUpdateUser, stealthActive }: SovereignSettingsViewProps) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [basedIn, setBasedIn] = useState<'Nigeria' | 'India' | 'Mexico' | 'Other'>(user.based_in || 'Other');
  const [homeSituation, setHomeSituation] = useState<'Living with parents' | 'Partner' | 'In-laws' | 'Siblings' | 'Other'>(user.home_situation);
  const [primaryGoal, setPrimaryGoal] = useState<'University degree' | 'Career growth' | 'Starting a business'>(user.primary_goal);
  
  // Custom secure state
  const [pinCode, setPinCode] = useState(() => localStorage.getItem(`heyvin_pin_${user.uid}`) || "");
  const [showPin, setShowPin] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Clear data dialog state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearChecked, setClearChecked] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    let loc: 'Lagos' | 'Delhi' | 'Mexico' | 'Other' = "Other";
    if (basedIn === 'Nigeria') loc = "Lagos";
    else if (basedIn === 'India') loc = "Delhi";
    else if (basedIn === 'Mexico') loc = "Mexico";

    const updatedUser: UserProfile = {
      ...user,
      username: username.trim() || user.username,
      email: email.trim() || user.email,
      based_in: basedIn,
      location: loc,
      home_situation: homeSituation,
      primary_goal: primaryGoal
    };

    // Save pin
    if (pinCode.trim()) {
      localStorage.setItem(`heyvin_pin_${user.uid}`, pinCode.trim());
    } else {
      localStorage.removeItem(`heyvin_pin_${user.uid}`);
    }

    onUpdateUser(updatedUser);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePurgeAllData = () => {
    if (!clearChecked) return;

    // Remove user records from pseudoshared db
    db.clearUserData(user.uid);
    // Remove local storage elements
    localStorage.removeItem("heyvin_current_user");
    localStorage.removeItem(`heyvin_pin_${user.uid}`);
    
    // Hard refresh to reload in logged-out landing state
    window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-[#EDE8E0] rounded-xl p-6 shadow-xs space-y-8">
      
      {/* Header section */}
      <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="p-1.5 bg-rose-50 text-[#7C2D3E] rounded-md flex items-center justify-center h-8 w-8">
            <User size={16} />
          </span>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#1A1414]">
              {stealthActive ? "User Profile Configuration" : "Sovereign Profile Settings"}
            </h3>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#7A6860]">
              {stealthActive ? "Academic settings and encryption preferences" : "Personalize credentials, regional target goals, and security shields"}
            </p>
          </div>
        </div>

        {isSaved && (
          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 animate-fadeIn">
            <Check size={10} /> Profile updated securely
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Details Column (Forms) */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans block">First Name</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#7C2D3E] text-gray-800 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans block">Secure Email</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#7C2D3E] text-gray-800 focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-gray-50">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans block">Region / Based In</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Nigeria', 'India', 'Mexico', 'Other'] as const).map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => setBasedIn(country)}
                      className={`py-2.5 rounded-xl text-[10.5px] font-bold border transition-all cursor-pointer text-center ${
                        basedIn === country
                          ? "border-[#7C2D3E] bg-[#FAF7F2] text-[#7C2D3E]"
                          : "border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans block">Current domestic situation</label>
                  <div className="relative">
                    <Home size={13} className="absolute left-3 top-3.5 text-gray-400 col-span-0.5" />
                    <select
                      value={homeSituation}
                      onChange={(e: any) => setHomeSituation(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#7C2D3E] text-gray-800 bg-white focus:outline-none font-medium"
                    >
                      {(['Living with parents', 'Partner', 'In-laws', 'Siblings', 'Other'] as const).map((situation) => (
                        <option key={situation} value={situation}>
                          {situation}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans block">Primary Autonomy Goal</label>
                  <div className="relative">
                    <Target size={13} className="absolute left-3 top-3.5 text-gray-400" />
                    <select
                      value={primaryGoal}
                      onChange={(e: any) => setPrimaryGoal(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#7C2D3E] text-gray-800 bg-white focus:outline-none font-medium"
                    >
                      {(['University degree', 'Career growth', 'Starting a business'] as const).map((goal) => (
                        <option key={goal} value={goal}>
                          {goal}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Lock PIN Setup to guard logs if uninvited guests use device */}
            <div className="pt-4 border-t border-gray-50 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#1A1414] flex items-center gap-1.5">
                    <Key size={13} className="text-[#C9983A]" />
                    Chamber Privacy Protect (PIN Pin Code)
                  </h4>
                  <p className="text-[10.5px] text-[#7A6860] mt-0.5 max-w-md leading-relaxed">
                    Set an optional 4-digit numeric code. If enabled, trying to exit stealth mode or view raw sovereignty scores will always ask for lock confirmation.
                  </p>
                </div>
              </div>

              <div className="relative max-w-[200px]">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={4}
                  placeholder="e.g. 1989"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 pr-10 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none tracking-[0.4em] font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 rounded-xl text-xs font-bold text-white bg-[#7C2D3E] cursor-pointer hover:bg-[#60202e] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Save size={14} />
              <span>Securely Save Preferences</span>
            </button>
          </form>
        </div>

        {/* Informative / High Security Action Sidebar */}
        <div className="space-y-6">
          <div className="p-4 bg-[#FAF7F2] border border-[#EDE8E0] rounded-xl space-y-3">
            <h4 className="text-xs font-serif font-bold text-gray-850 flex items-center gap-1.5">
              <Shield size={13} className="text-emerald-700" /> Local Autonomy Protection
            </h4>
            <p className="text-[11px] text-[#7A6860] leading-relaxed">
              Heyvin AI operates entirely on client-side sandboxing, secure pseudonym algorithms, and temporary server proxies. Your family members, domestic partners, and network hosts have zero visibility of your career blueprints.
            </p>
            <div className="border-t border-gray-150 pt-2 text-[10.5px] text-gray-500 font-serif italic">
              "Your intellectual pursuits are a sovereign domain. Safeguard your pacing."
            </div>
          </div>

          <div className="p-4 bg-red-50/40 border border-red-100 rounded-xl space-y-4">
            <h4 className="text-xs font-serif font-bold text-red-950 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-red-700" /> Danger Zone
            </h4>

            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="w-full text-left py-2 px-3 border border-red-200 hover:bg-red-50 text-red-700 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={12} /> Purge This Account & Data
              </button>
            ) : (
              <div className="space-y-3 animate-fadeIn">
                <p className="text-[10px] text-red-800 leading-normal">
                  Warning: Triggering a database purge instantly deletes your logs, saved CBT cards, check-in history, journals, and signed session metrics. This cannot be undone.
                </p>
                <label className="flex items-start gap-2 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clearChecked}
                    onChange={(e) => setClearChecked(e.target.checked)}
                    className="mt-0.5 text-red-650 h-3 w-3 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-gray-600 leading-tight">
                    Yes, I wish to delete all local history permanently.
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClearConfirm(false);
                      setClearChecked(false);
                    }}
                    className="flex-1 py-1 px-2 border text-gray-500 text-[10px] font-bold rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!clearChecked}
                    onClick={handlePurgeAllData}
                    className="flex-1 py-1 px-2 bg-red-750 hover:bg-red-800 disabled:bg-gray-100 disabled:text-gray-400 text-white text-[10px] font-bold rounded-md cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    <Trash2 size={10} /> Delete Setup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
