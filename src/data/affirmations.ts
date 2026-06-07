export interface Affirmation {
  id: number;
  text: string;
  market_theme: 'Lagos' | 'Delhi' | 'Mexico' | 'General';
  tonality: 'strategic' | 'boundaries' | 'resilience' | 'empowered';
}

export const affirmations: Affirmation[] = [
  {
    id: 1,
    text: "The woman who protects her study hours is not being selfish. She is being strategic.",
    market_theme: "General",
    tonality: "strategic"
  },
  {
    id: 2,
    text: "You are not responsible for managing everyone's emotions. You are responsible for building your future.",
    market_theme: "General",
    tonality: "boundaries"
  },
  {
    id: 3,
    text: "Rest is not laziness. In a home that runs on your energy, protecting your rest is an act of resistance.",
    market_theme: "General",
    tonality: "resilience"
  },
  {
    id: 4,
    text: "You did not survive every obstacle this far to burn out quietly in your own bedroom.",
    market_theme: "General",
    tonality: "resilience"
  },
  {
    id: 5,
    text: "Your goals did not come with an expiry date. But your youth and energy do. Guard them.",
    market_theme: "General",
    tonality: "strategic"
  },
  {
    id: 6,
    text: "No is a complete sentence. You do not owe anyone a three-paragraph explanation for protecting your time.",
    market_theme: "General",
    tonality: "boundaries"
  },
  {
    id: 7,
    text: "The pressure you feel at home is real. So is your ability to build something extraordinary in spite of it.",
    market_theme: "General",
    tonality: "resilience"
  },
  {
    id: 8,
    text: "Small pockets of peace, repeated daily, are enough to build something great.",
    market_theme: "General",
    tonality: "strategic"
  },
  {
    id: 9,
    text: "You are not too ambitious. Your environment is too small for what you're becoming.",
    market_theme: "General",
    tonality: "empowered"
  },
  {
    id: 10,
    text: "Every hour you reclaim from chaos is an hour invested in the version of you that nobody can take away.",
    market_theme: "General",
    tonality: "strategic"
  },
  {
    id: 11,
    text: "The family pressure you handle is heavy, but your success will one day reframe the entire family's story.",
    market_theme: "General",
    tonality: "empowered"
  },
  {
    id: 12,
    text: "Omo, you didn't come this far to stop now. Lagos is tough, but you are tougher.",
    market_theme: "Lagos",
    tonality: "resilience"
  },
  {
    id: 13,
    text: "Your brilliance doesn't pause because the house is loud. Find the window. Use it.",
    market_theme: "Lagos",
    tonality: "strategic"
  },
  {
    id: 14,
    text: "Chica, el futuro que imaginas ya existe. Solo necesitas el tiempo para construirlo.",
    market_theme: "Mexico",
    tonality: "empowered"
  },
  {
    id: 15,
    text: "Beta, your parents' expectations and your own dreams are not always the same thing. You choose which to honour first.",
    market_theme: "Delhi",
    tonality: "boundaries"
  },
  {
    id: 16,
    text: "Protecting your mental energy is not selfishness. It is the most responsible thing you can do for your potential.",
    market_theme: "General",
    tonality: "boundaries"
  },
  {
    id: 17,
    text: "The woman who logs her friction and learns her patterns is already 3 steps ahead of the chaos.",
    market_theme: "General",
    tonality: "strategic"
  },
  {
    id: 18,
    text: "You are not falling behind. You are navigating a harder path than most people can imagine.",
    market_theme: "General",
    tonality: "resilience"
  },
  {
    id: 19,
    text: "The goal is not a perfect home environment. The goal is building your future despite an imperfect one.",
    market_theme: "General",
    tonality: "strategic"
  },
  {
    id: 20,
    text: "Your cognitive bandwidth is finite and precious. Spend it on what compounds.",
    market_theme: "General",
    tonality: "strategic"
  },
  {
    id: 21,
    text: "There is nothing weak about needing a safe space to think. The strongest people build them actively.",
    market_theme: "General",
    tonality: "boundaries"
  },
  {
    id: 22,
    text: "Progress made in quiet stolen hours still counts. It always counted.",
    market_theme: "General",
    tonality: "resilience"
  },
  {
    id: 23,
    text: "You are not the chaos in your home. You are the clarity trying to break through it.",
    market_theme: "General",
    tonality: "empowered"
  },
  {
    id: 24,
    text: "Rest when you can. Work when you find the window. This is not giving up — this is strategy.",
    market_theme: "General",
    tonality: "strategic"
  },
  {
    id: 25,
    text: "The world will eventually see what you are building. Right now, Heyvin sees it.",
    market_theme: "General",
    tonality: "empowered"
  },
  {
    id: 26,
    text: "Your story does not end here. Not in this kitchen, not in this argument, not in this semester.",
    market_theme: "General",
    tonality: "resilience"
  },
  {
    id: 27,
    text: "You are too specific to be generic. Too rare to be average. Too close to stop.",
    market_theme: "General",
    tonality: "empowered"
  },
  {
    id: 28,
    text: "The success audit is not about perfection. It's about knowing yourself well enough to protect yourself.",
    market_theme: "General",
    tonality: "strategic"
  },
  {
    id: 29,
    text: "What you are building matters beyond what anyone in your home currently understands.",
    market_theme: "General",
    tonality: "empowered"
  },
  {
    id: 30,
    text: "Sovereignty is not given. It is reclaimed, hour by hour, boundary by boundary. That is what you are doing.",
    market_theme: "General",
    tonality: "boundaries"
  }
];

export function getAffirmation(stress_level?: number): string {
  // If high stress, get high stress specific (resilience or pressure)
  if (stress_level && stress_level > 70) {
    const highStressIndices = [11, 12, 17, 18, 22, 25, 29]; // indices for Lagos, Delhi, CDMX pressure/resilience
    const randIdx = highStressIndices[Math.floor(Math.random() * highStressIndices.length)];
    return affirmations[randIdx].text;
  }
  
  // Choose daily based on day of year
  const dayOfYear = Math.floor(Date.now() / 86400000);
  return affirmations[dayOfYear % affirmations.length].text;
}
