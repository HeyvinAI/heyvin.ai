import React, { useState } from "react";
import { 
  User, Mail, MapPin, Home, Target, Shield, RefreshCw, Trash2, 
  Eye, EyeOff, Save, Check, Key, Smartphone, AlertTriangle, Sparkles, Loader2 
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

  // Premium membership & checkout state
  const [isPro, setIsPro] = useState(() => {
    return localStorage.getItem("heyvin_premium_unlocked") === "true";
  });
  const [billingLoading, setBillingLoading] = useState(false);

  // Paystack high-fidelity express overlay simulation states
  const [showPaystackExpress, setShowPaystackExpress] = useState(false);
  const [paystackCardNum, setPaystackCardNum] = useState("");
  const [paystackExpiry, setPaystackExpiry] = useState("");
  const [paystackCvv, setPaystackCvv] = useState("");
  const [paystackPin, setPaystackPin] = useState("");
  const [paystackOtp, setPaystackOtp] = useState("");
  const [paystackStage, setPaystackStage] = useState<'form' | 'pin' | 'otp' | 'success'>('form');
  const [paystackLoadingText, setPaystackLoadingText] = useState("Connecting Secure Paystack Gateway...");

  React.useEffect(() => {
    const localPro = localStorage.getItem("heyvin_premium_unlocked") === "true";
    if (localPro) {
      setIsPro(true);
    } else {
      fetch(`/api/user/premium-status/${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.is_pro) {
            setIsPro(true);
            localStorage.setItem("heyvin_premium_unlocked", "true");
          }
        })
        .catch(e => console.error("Error loading subscription status:", e));
    }
  }, [user.uid]);

  const handlePaystackCheckout = () => {
    setBillingLoading(true);
    setPaystackLoadingText("Connecting with Paystack secure sandbox...");
    setTimeout(() => {
      setBillingLoading(false);
      setShowPaystackExpress(true);
      setPaystackStage('form');
    }, 700);
  };

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

          {/* Feature 4: Paystack billing subscription module block */}
          <div className="p-4 bg-gradient-to-br from-orange-50/70 to-red-50/50 border border-orange-200/60 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#7C2D3E] animate-pulse" />
                Heyvin Pro Upgrade
              </h4>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                isPro 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                  : "bg-orange-100 text-[#7C2D3E] border border-orange-200"
              }`}>
                {isPro ? "Active" : "₦2,000 / mo"}
              </span>
            </div>
            
            <p className="text-[11px] text-gray-700 leading-normal">
              {isPro
                ? "Congratulations! Your secure channel is boosted. You have infinite access to personal schedule templates, CBT grounding toolkits, and premium weekly reports."
                : "Unlock sovereign focus with professional grade AI weekly forecasting, priority server bandwidth, and automated domestic schedule planners."
              }
            </p>
            
            {!isPro ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handlePaystackCheckout}
                  disabled={billingLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#7C2D3E] hover:bg-[#60202e] text-white text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {billingLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>Upgrade via Paystack</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("heyvin_premium_unlocked", "true");
                    setIsPro(true);
                    window.dispatchEvent(new Event("storage"));
                    window.location.reload();
                  }}
                  className="w-full py-1.5 px-3 text-[10px] text-amber-900 border border-amber-800/20 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-all font-bold tracking-wide cursor-pointer"
                >
                  ⚡ Sandbox Instant Bypass (Unlock Pro)
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center font-bold text-emerald-800 text-[10.5px] flex items-center justify-center gap-1.5 pt-1">
                  <span>✓ Premium Account Sovereign Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("heyvin_premium_unlocked");
                    setIsPro(false);
                    window.dispatchEvent(new Event("storage"));
                    window.location.reload();
                  }}
                  className="w-full py-1.5 px-2 text-[9px] text-[#7C2D3E] border border-red-200 hover:bg-red-50 rounded-xl transition-all font-semibold font-mono tracking-wider cursor-pointer"
                >
                  Demo Lock (Revert to Standard)
                </button>
              </div>
            )}
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

      {/* 2026 HIGH-FIDELITY PAYSTACK EXPRESS PAYMENT GATE OVERLAY */}
      {showPaystackExpress && (
        <div id="paystack_express_overlay" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn select-none text-left">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden relative font-sans text-gray-800">
            
            {/* Paystack Widget Header */}
            <div className="bg-[#FAF7F2] p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2.5 bg-emerald-600 rounded text-white text-[11px] font-black tracking-widest uppercase">
                  paystack
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#1A1414] block leading-none font-sans">Heyvin Pro Authorization</span>
                  <span className="text-[9px] text-[#7A6860] mt-0.5 block">secure-gateway@heyvin.ai</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPaystackExpress(false);
                  setBillingLoading(false);
                }}
                className="p-1.5 hover:bg-gray-200/50 rounded-lg text-gray-500 transition-colors cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Paystack Channels Sidebar & Form Columns */}
            <div className="grid grid-cols-12 min-h-[300px]">
              
              {/* Sidebar Channels (Card, Bank, Transfer) */}
              <div className="col-span-4 bg-gray-50/50 border-r border-gray-100 p-3 space-y-2 text-[10px] font-bold">
                <div className="text-[8px] uppercase tracking-wider text-gray-400 font-mono mb-2">Payment Option</div>
                <button type="button" className="w-full text-left p-2 rounded-lg bg-emerald-50 text-emerald-800 flex items-center gap-2 border border-emerald-200 font-sans text-[10px]">
                  <span>💳 Card</span>
                </button>
                <button type="button" className="w-full text-left p-2 rounded-lg text-gray-500 hover:bg-gray-100/30 flex items-center gap-2 cursor-default font-sans text-[10px]">
                  <span>🏦 Bank</span>
                </button>
                <button type="button" className="w-full text-left p-2 rounded-lg text-gray-500 hover:bg-gray-100/30 flex items-center gap-2 cursor-default font-sans text-[10px]">
                  <span>🔄 Transfer</span>
                </button>
              </div>

              {/* Active Channel Form Content */}
              <div className="col-span-8 p-5 flex flex-col justify-between">
                
                {paystackStage === 'form' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!paystackCardNum || !paystackExpiry || !paystackCvv) return;
                    setPaystackStage('pin');
                  }} className="space-y-4">
                    <div className="text-center pb-2 border-b border-gray-50">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest font-mono">Simulated Charge</span>
                      <div className="text-2xl font-serif font-black text-amber-950 mt-1">NGN 2,000</div>
                      <span className="text-[10px] text-emerald-600 font-bold font-mono tracking-wide">● Sandbox Test Mode</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9.5px] uppercase font-extrabold tracking-wider text-gray-400 font-mono">Card Number</label>
                        <input
                          type="text"
                          required
                          placeholder="4000 1234 5678 9010"
                          value={paystackCardNum}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                            const matches = v.match(/\d{4,16}/g);
                            const match = matches && matches[0] || v;
                            const parts = [];
                            for (let i = 0, len = match.length; i < len; i += 4) {
                              parts.push(match.substring(i, i + 4));
                            }
                            setPaystackCardNum(parts.length > 0 ? parts.join(' ') : v);
                          }}
                          className="w-full p-2.5 border border-gray-250 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 font-mono text-center tracking-widest text-xs bg-white text-gray-800"
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9.5px] uppercase font-extrabold tracking-wider text-gray-400 font-mono">Expiry</label>
                          <input
                            type="text"
                            required
                            placeholder="12/28"
                            value={paystackExpiry}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                              if (v.length >= 2) {
                                setPaystackExpiry(v.substring(0, 2) + "/" + v.substring(2, 4));
                              } else {
                                setPaystackExpiry(v);
                              }
                            }}
                            className="w-full p-2.5 border border-gray-250 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 font-mono text-center text-xs bg-white text-gray-800"
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9.5px] uppercase font-extrabold tracking-wider text-gray-400 font-mono">CVV</label>
                          <input
                            type="password"
                            required
                            placeholder="•••"
                            value={paystackCvv}
                            onChange={(e) => setPaystackCvv(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full p-2.5 border border-gray-250 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 font-mono text-center text-xs bg-white text-gray-800"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={paystackCardNum.length < 16 || paystackExpiry.length < 5 || paystackCvv.length < 3}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md"
                    >
                      Pay NGN 2,000
                    </button>
                  </form>
                )}

                {paystackStage === 'pin' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!paystackPin) return;
                    setPaystackStage('otp');
                  }} className="space-y-4 my-auto">
                    <div className="text-center space-y-1">
                      <span className="text-xl">🔑</span>
                      <h4 className="text-sm font-bold text-gray-800 font-sans">Enter Card PIN</h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed">Please provide your secure 4-digit bank card authorization number.</p>
                    </div>

                    <input
                      type="password"
                      required
                      placeholder="••••"
                      value={paystackPin}
                      onChange={(e) => setPaystackPin(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-24 mx-auto block p-2.5 border border-gray-250 rounded-lg focus:ring-1 focus:ring-emerald-500 text-center font-mono text-lg tracking-widest focus:outline-none bg-white text-gray-800"
                      maxLength={4}
                    />

                    <button
                      type="submit"
                      disabled={paystackPin.length < 4}
                      className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Authorize Transaction
                    </button>
                  </form>
                )}

                {paystackStage === 'otp' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!paystackOtp) return;
                    
                    setPaystackStage('success');
                    setIsPro(true);
                    localStorage.setItem("heyvin_premium_unlocked", "true");
                    
                    await fetch('/api/paystack/webhook', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'x-paystack-signature': 'MOCK_SIGNATURE'
                      },
                      body: JSON.stringify({
                        event: 'charge.success',
                        data: {
                          reference: 'MOCK_REF_' + Math.random().toString(36).substring(7),
                          status: 'success',
                          amount: 200000,
                          metadata: { user_id: user.uid },
                          customer: { email: user.email || 'purchase@heyvin.ai' }
                        }
                      })
                    }).catch(err => console.warn("Background pro synchronization bypassed:", err));

                  }} className="space-y-4 my-auto">
                    <div className="text-center space-y-1">
                      <span className="text-xl">📲</span>
                      <h4 className="text-sm font-bold text-gray-800 font-sans">Authorize with OTP</h4>
                      <p className="text-[9.5px] text-gray-400 leading-relaxed">A test authentication code was sent to your phone. Use <strong className="text-emerald-700">1234</strong> to bypass:</p>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="1234"
                      value={paystackOtp}
                      onChange={(e) => setPaystackOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-28 mx-auto block p-2.5 border border-gray-250 rounded-lg focus:ring-1 focus:ring-emerald-500 text-center font-mono text-base tracking-widest focus:outline-none bg-white text-gray-800"
                      maxLength={4}
                    />

                    <button
                      type="submit"
                      disabled={paystackOtp.length < 4}
                      className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Authenticate Payment
                    </button>
                  </form>
                )}

                {paystackStage === 'success' && (
                  <div className="space-y-4 text-center my-auto py-4 animate-scaleUp">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-lg font-bold animate-bounce">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-800 font-sans">Sovereignty Upgrade Complete!</h4>
                      <p className="text-[10px] text-gray-500 leading-normal max-w-sm mx-auto mt-1">
                        Sovereign Gold Access is now unlocked. You have unlimited access to journals, weekly reports, premium hotlines, and midnight modes!
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPaystackExpress(false);
                        onUpdateUser({
                          ...user
                        });
                      }}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer inline-block"
                    >
                      Review My Features
                    </button>
                  </div>
                )}

              </div>

            </div>

            {/* Paystack Widget Footer Seal */}
            <div className="bg-gray-50 p-2.5 border-t border-gray-100 text-center text-[9px] text-gray-400 font-mono tracking-tight flex items-center justify-center gap-1">
              <span>🔒 Secured by</span> <strong className="text-emerald-700">paystack</strong>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
