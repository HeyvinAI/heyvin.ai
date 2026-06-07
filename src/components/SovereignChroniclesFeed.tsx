import React, { useState } from "react";
import { 
  Sparkles, Heart, Globe, BookOpen, AlertCircle, Quote, 
  MessageSquare, ThumbsUp, Send, UserCheck, Shield, ChevronRight, Bookmark
} from "lucide-react";

interface Article {
  id: string;
  source: string;
  avatarLetter: string;
  avatarBg: string;
  location: string;
  timeAgo: string;
  category: 'Stealth Tips' | 'Success Stories' | 'Chore hacks' | 'Aspirations';
  title: string;
  summary: string;
  content: string;
  likes: number;
  commentsCount: number;
  initialComments: Array<{ sister: string; text: string; time: string }>;
}

export function SovereignChroniclesFeed() {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: "art_1",
      source: "Lagos Sister",
      avatarLetter: "O",
      avatarBg: "bg-red-500",
      location: "Yaba, Lagos, Nigeria",
      timeAgo: "2 hours ago",
      category: "Stealth Tips",
      title: "How I hid my React study repo as an 'Intro to Cookery' pdf",
      summary: "My parents believe women belong purely in domestic administration. Here is how I set up my desktop screen & folder structures to deflect immediate checking.",
      content: "Whenever my father approaches, I trigger a seamless shortcut to restore an full-width PDF on culinary arts. On my actual shell, I keep node servers running in stealth. I've reclaimed four hours daily and just cleared my intermediate certification!",
      likes: 42,
      commentsCount: 3,
      initialComments: [
        { sister: "Delhi_Delta_9", text: "Brilliant! I do the exact same with my Python folders named as local accounting ledgers.", time: "1h ago" },
        { sister: "Oaxaca_Coder", text: "This level of stealth planning is what saves degrees. Stay sovereign sister!", time: "45m ago" }
      ]
    },
    {
      id: "art_2",
      source: "Delhi Sister",
      avatarLetter: "A",
      avatarBg: "bg-amber-600",
      location: "New Delhi, India",
      timeAgo: "5 hours ago",
      category: "Success Stories",
      title: "Uncompromising boundaries: From 12-hour kitchen load to a Tech Freelance track",
      summary: "A heartfelt diary entry on transitioning from infinite household demands to strict, respectful chore schedules that secured a paid remoto internship.",
      content: "After using the Appreciative Assertiveness script, I told my brothers that the afternoon is strictly reserved for my computer laboratory courses. They now tackle washing tasks in rotation. I just signed my first freelance contract with a Dublin agency!",
      likes: 58,
      commentsCount: 4,
      initialComments: [
        { sister: "Calabar_Queen", text: "Reading this gives me the absolute courage to sit my brothers down tonight.", time: "3h ago" },
        { sister: "Monterrey_M", text: "You earned this victory. 12 hours of domestic load is heavy systemic friction.", time: "2h ago" }
      ]
    },
    {
      id: "art_3",
      source: "Mexico City Sister",
      avatarLetter: "S",
      avatarBg: "bg-teal-600",
      location: "CDMX, Mexico",
      timeAgo: "1 day ago",
      category: "Chore hacks",
      title: "The power-outage focus shield: Anchoring when generators scream",
      summary: "Living with four in-laws makes silence impossible. How I use white noise generators and somatic 5-4-3-2-1 centering to maintain memory retention.",
      content: "Whenever the generators are turned on, the acoustic levels are painful. I configure my headphones on heavy rain, and practice the somatic counting technique in 5-minute clips. It keeps my prefrontal cortex clean and avoids immediate stress spikes.",
      likes: 31,
      commentsCount: 1,
      initialComments: [
        { sister: "Pricilla_L", text: "Somatic grounding works magic. It separates external noise from our intellectual workspace.", time: "18h ago" }
      ]
    },
    {
      id: "art_4",
      source: "Sovereign Sisterhood",
      avatarLetter: "H",
      avatarBg: "bg-rose-700",
      location: "Community Dispatch",
      timeAgo: "2 days ago",
      category: "Aspirations",
      title: "Self-Sovereignty is not rebellion; it is your ultimate duty to your potential",
      summary: "An editorial on balancing cultural respect, domestic core contribution, and the non-negotiability of independent financial security.",
      content: "We serve our immediate families with grace, but we belong to our own futures. Real growth is achieved when young women can secure safe spaces, audit their schedules with extreme accuracy, and claim complete command over their time capital.",
      likes: 94,
      commentsCount: 6,
      initialComments: [
        { sister: "Ibadan_Dev", text: "This article should be pinned on every girl's mirror.", time: "1d ago" },
        { sister: "Bengaluru_B", text: "Financial independence is the singular shield. Everything else builds on that floor.", time: "1d ago" }
      ]
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Stealth Tips' | 'Success Stories' | 'Chore hacks' | 'Aspirations'>('All');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  
  // Custom user commentary states
  const [activeCommentForId, setActiveCommentForId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

  const handleLike = (id: string) => {
    const updatedLiked = new Set(likedArticles);
    if (updatedLiked.has(id)) {
      updatedLiked.delete(id);
      setArticles(prev => prev.map(art => art.id === id ? { ...art, likes: art.likes - 1 } : art));
    } else {
      updatedLiked.add(id);
      setArticles(prev => prev.map(art => art.id === id ? { ...art, likes: art.likes + 1 } : art));
    }
    setLikedArticles(updatedLiked);
  };

  const handleAddComment = (articleId: string) => {
    if (!newCommentText.trim()) return;

    // Pick a fun prefix sister name
    const randomSisters = ["Future_Doctor_NG", "Sovereign_Dev_IN", "Discreet_Scholar", "Guarded_Soul_MX", "Sister_Shield"];
    const chosenSister = randomSisters[Math.floor(Math.random() * randomSisters.length)];

    setArticles(prev => prev.map(art => {
      if (art.id === articleId) {
        return {
          ...art,
          commentsCount: art.commentsCount + 1,
          initialComments: [
            ...art.initialComments,
            { sister: chosenSister, text: newCommentText.trim(), time: "Just now" }
          ]
        };
      }
      return art;
    }));

    setNewCommentText("");
    setActiveCommentForId(null);
  };

  const filteredArticles = selectedCategory === 'All' 
    ? articles
    : articles.filter(art => art.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pt-12 border-t border-[#EDE8E0] mt-12 text-left">
      
      {/* Feed Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100/40 text-[#7C2D3E] font-bold text-[10px] uppercase tracking-widest">
            <Globe size={11} className="animate-spin" /> Sisterhood Insights Feed
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1A1414] mt-2">
            The Sovereign Chronicles
          </h2>
          <p className="text-xs text-[#7A6860] mt-1 font-sans max-w-lg leading-relaxed">
            Real diary snapshots, tactical chore negotiations, and stealth-study frameworks curated from our global network of resilient, ambitious sisters.
          </p>
        </div>

        {/* Quick horizontal categories selector */}
        <div className="flex flex-wrap gap-1.5 text-xs font-sans">
          {(['All', 'Stealth Tips', 'Success Stories', 'Chore hacks', 'Aspirations'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-1.5 px-3 rounded-full font-bold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#7C2D3E] text-white border-[#7C2D3E] shadow-xs"
                  : "bg-white border-[#EDE8E0] text-[#7A6860] hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Chronicles Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {filteredArticles.map(art => {
          const isExpanded = expandedArticleId === art.id;
          const hasLiked = likedArticles.has(art.id);

          return (
            <div 
              key={art.id}
              className="bg-white border border-[#EDE8E0] hover:border-gray-250 transition-all rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 relative group"
            >
              {/* Category indicator pill */}
              <div className="flex items-center justify-between">
                <span className={`text-[9.5px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md border ${
                  art.category === 'Stealth Tips' ? "bg-amber-50 text-amber-900 border-amber-100" :
                  art.category === 'Success Stories' ? "bg-emerald-50 text-emerald-900 border-emerald-100" :
                  art.category === 'Chore hacks' ? "bg-teal-50 text-teal-900 border-teal-100" :
                  "bg-rose-50 text-rose-900 border-rose-100"
                }`}>
                  {art.category}
                </span>
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                  <Bookmark size={10} /> Saved to sister-block
                </span>
              </div>

              {/* Title and Summary */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-base text-[#1A1414] group-hover:text-[#7C2D3E] transition-colors leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-[#7A6860] leading-relaxed font-sans">
                  {art.summary}
                </p>
              </div>

              {/* Interactive Read More Section */}
              {isExpanded && (
                <div className="bg-[#FAF7F2]/60 border-l-2 border-[#7C2D3E] p-3 rounded-r-lg font-serif italic text-xs leading-relaxed text-[#1A1414] animate-fadeIn">
                  <Quote size={12} className="text-[#7C2D3E] opacity-35 mb-1" />
                  <p>{art.content}</p>
                </div>
              )}

              {/* Sister Meta footer */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${art.avatarBg} text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner`}>
                    {art.avatarLetter}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[#1A1414] font-sans">{art.source}</h4>
                    <span className="text-[9.5px] text-[#7A6860] font-mono block leading-none">{art.location} · {art.timeAgo}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                  className="text-[10.5px] font-sans font-extrabold text-[#7C2D3E] hover:text-[#501c27] flex items-center gap-0.5 cursor-pointer"
                >
                  {isExpanded ? "Hide Details" : "Read Post"} <ChevronRight size={12} className={`transform transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>
              </div>

              {/* Global Sister Interaction Controls */}
              <div className="flex items-center gap-4 text-xs font-sans border-t border-gray-50 pt-2.5">
                <button
                  onClick={() => handleLike(art.id)}
                  className={`inline-flex items-center gap-1 cursor-pointer font-bold ${
                    hasLiked ? "text-red-650" : "text-[#7A6860] hover:text-red-500"
                  }`}
                >
                  <ThumbsUp size={12} fill={hasLiked ? "#DC2626" : "none"} className={hasLiked ? "scale-110 transition-transform" : ""} />
                  <span>{art.likes} Support</span>
                </button>

                <button
                  onClick={() => setActiveCommentForId(activeCommentForId === art.id ? null : art.id)}
                  className="inline-flex items-center gap-1 text-[#7A6860] hover:text-[#7C2D3E] cursor-pointer font-bold"
                >
                  <MessageSquare size={12} />
                  <span>{art.commentsCount} Sister Reply</span>
                </button>
              </div>

              {/* COMMENTS PANEL */}
              {(isExpanded || activeCommentForId === art.id) && (
                <div className="border-t border-gray-105 pt-3 mt-1.5 space-y-2 text-[11px] animate-fadeIn">
                  <h5 className="font-bold text-gray-500 uppercase tracking-widest text-[9px] mb-2 font-sans">Reply Threads</h5>
                  
                  <div className="space-y-2 p-2 bg-[#FAF7F2] rounded-lg max-h-[140px] overflow-y-auto">
                    {art.initialComments.map((comm, cIdx) => (
                      <div key={cIdx} className="space-y-0.5 leading-relaxed">
                        <div className="flex justify-between items-center bg-white/70 px-2 py-1 rounded border border-orange-100/10">
                          <span className="font-extrabold text-[#7C2D3E] text-[10px]">{comm.sister}</span>
                          <span className="text-[8.5px] text-[#7A6860] font-mono">{comm.time}</span>
                        </div>
                        <p className="text-[#1A1414] pl-2 font-sans">{comm.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add comment box */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Comment anonymously (Encrypted channel)..."
                      value={activeCommentForId === art.id ? newCommentText : ""}
                      onClick={() => setActiveCommentForId(art.id)}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(art.id)}
                      className="flex-1 p-2 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddComment(art.id)}
                      className="p-2 rounded-lg bg-[#7C2D3E] hover:bg-[#60202e] text-white flex items-center justify-center cursor-pointer transition-all h-8 w-8"
                    >
                      <Send size={10} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
