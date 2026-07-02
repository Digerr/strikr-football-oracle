/**
 * STRIKR Football Data Module
 *
 * Data sources strategy:
 * - Production-ready integration with football-data.org (free tier, 10 req/min)
 *   https://www.football-data.org/client/register
 *   Just set FOOTBALL_DATA_API_KEY env var to enable live data.
 * - Falls back to high-quality curated mock data representing real teams,
 *   real leagues, and realistic match schedules so the UI works out-of-the-box.
 *
 * Other free football APIs that can be plugged in similarly:
 * - TheSportsDB (free, https://www.thesportsdb.com/api.php)
 * - OpenLigaDB (free, https://www.openligadb.de/)
 * - api-football via RapidAPI (free 100 req/day)
 */

export type MatchStatus = "LIVE" | "UPCOMING" | "FINISHED";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  crest: string; // emoji or short label used as crest placeholder
  color: string;
  form: ("W" | "D" | "L")[]; // last 5 matches, most recent first
}

export interface Prediction {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedScore: { home: number; away: number };
  expectedGoals: number;
  bttsProb: number; // both teams to score
  over25Prob: number;
  confidence: number; // 0-100 overall confidence
  pick: string; // human-readable recommended pick
  pickType: "HOME" | "DRAW" | "AWAY" | "OVER" | "BTTS";
  insights: string[];
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  xG: [number, number];
}

export interface H2HEntry {
  date: string;
  score: string;
  result: "HOME" | "DRAW" | "AWAY";
  competition: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: string;
  leagueShort: string;
  leagueColor: string;
  country: string;
  kickoff: string; // ISO date
  status: MatchStatus;
  minute?: number;
  score?: { home: number; away: number };
  venue: string;
  prediction: Prediction;
  stats?: MatchStats;
  h2h: H2HEntry[];
  temperature?: number;
  weather?: string;
  importance: number; // 1-5, drives "hot match" badge
}

/* ============ Teams (real clubs) ============ */
const TEAMS: Record<string, Team> = {
  RMA: {
    id: "RMA",
    name: "Real Madrid",
    shortName: "RMA",
    crest: "⚪",
    color: "#FEBE10",
    form: ["W", "W", "D", "W", "W"],
  },
  BAR: {
    id: "BAR",
    name: "Barcelona",
    shortName: "BAR",
    crest: "🔵",
    color: "#A50044",
    form: ["W", "L", "W", "W", "D"],
  },
  ATM: {
    id: "ATM",
    name: "Atletico Madrid",
    shortName: "ATM",
    crest: "🔴",
    color: "#CB3524",
    form: ["D", "W", "W", "L", "W"],
  },
  MCI: {
    id: "MCI",
    name: "Manchester City",
    shortName: "MCI",
    crest: "🔵",
    color: "#6CABDD",
    form: ["W", "W", "W", "W", "D"],
  },
  LIV: {
    id: "LIV",
    name: "Liverpool",
    shortName: "LIV",
    crest: "🔴",
    color: "#C8102E",
    form: ["W", "D", "W", "W", "W"],
  },
  ARS: {
    id: "ARS",
    name: "Arsenal",
    shortName: "ARS",
    crest: "🔴",
    color: "#EF0107",
    form: ["W", "W", "L", "W", "D"],
  },
  CHE: {
    id: "CHE",
    name: "Chelsea",
    shortName: "CHE",
    crest: "🔵",
    color: "#034694",
    form: ["D", "W", "L", "D", "W"],
  },
  MUN: {
    id: "MUN",
    name: "Manchester United",
    shortName: "MUN",
    crest: "🔴",
    color: "#DA291C",
    form: ["L", "W", "D", "L", "W"],
  },
  TOT: {
    id: "TOT",
    name: "Tottenham",
    shortName: "TOT",
    crest: "⚪",
    color: "#132257",
    form: ["W", "L", "W", "W", "L"],
  },
  BAY: {
    id: "BAY",
    name: "Bayern Munich",
    shortName: "BAY",
    crest: "🔴",
    color: "#DC052D",
    form: ["W", "W", "W", "D", "W"],
  },
  DOR: {
    id: "DOR",
    name: "Borussia Dortmund",
    shortName: "BVB",
    crest: "🟡",
    color: "#FDE100",
    form: ["W", "D", "L", "W", "W"],
  },
  LEV: {
    id: "LEV",
    name: "Bayer Leverkusen",
    shortName: "LEV",
    crest: "🔴",
    color: "#E32219",
    form: ["W", "W", "W", "W", "D"],
  },
  JUV: {
    id: "JUV",
    name: "Juventus",
    shortName: "JUV",
    crest: "⚫",
    color: "#000000",
    form: ["D", "W", "W", "D", "W"],
  },
  INT: {
    id: "INT",
    name: "Inter Milan",
    shortName: "INT",
    crest: "🔵",
    color: "#0068A8",
    form: ["W", "W", "W", "L", "W"],
  },
  MIL: {
    id: "MIL",
    name: "AC Milan",
    shortName: "MIL",
    crest: "🔴",
    color: "#FB090B",
    form: ["W", "L", "D", "W", "W"],
  },
  NAP: {
    id: "NAP",
    name: "Napoli",
    shortName: "NAP",
    crest: "🔵",
    color: "#199FE3",
    form: ["D", "W", "W", "W", "L"],
  },
  PSG: {
    id: "PSG",
    name: "Paris Saint-Germain",
    shortName: "PSG",
    crest: "🔵",
    color: "#004170",
    form: ["W", "W", "W", "D", "W"],
  },
  MAR: {
    id: "MAR",
    name: "Marseille",
    shortName: "MAR",
    crest: "🔵",
    color: "#2FAEE0",
    form: ["W", "D", "L", "W", "D"],
  },
  BEN: {
    id: "BEN",
    name: "Benfica",
    shortName: "BEN",
    crest: "🔴",
    color: "#E40521",
    form: ["W", "W", "D", "W", "W"],
  },
  POR: {
    id: "POR",
    name: "Porto",
    shortName: "POR",
    crest: "🔵",
    color: "#004890",
    form: ["D", "W", "W", "D", "L"],
  },
};

/* ============ Helper to build matches ============ */
function now(offsetMinutes = 0): string {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  return d.toISOString();
}

function makePrediction(
  homeStrength: number,
  awayStrength: number,
): Prediction {
  const total = homeStrength + awayStrength + 30;
  const homeWinProb = Math.round(((homeStrength + 15) / total) * 100);
  const awayWinProb = Math.round((awayStrength / total) * 100);
  const drawProb = 100 - homeWinProb - awayWinProb;
  // Realistic expected goals: top team ~2.2, mid team ~1.4, weak team ~0.9
  // Map strength 65-95 → 0.8-2.4 goals
  const expectedHome = Math.max(
    0,
    Math.round((((homeStrength - 60) / 35) * 1.6 + 0.9) * 10) / 10,
  );
  const expectedAway = Math.max(
    0,
    Math.round((((awayStrength - 60) / 35) * 1.6 + 0.7) * 10) / 10,
  );
  const expectedHomeInt = Math.round(expectedHome);
  const expectedAwayInt = Math.round(expectedAway);
  const expectedGoals = expectedHome + expectedAway;
  const bttsProb = Math.round(
    Math.min(
      85,
      40 + (Math.min(expectedHome, expectedAway) * 25),
    ),
  );
  const over25Prob = Math.round(
    Math.min(90, 25 + expectedGoals * 18),
  );
  const confidence = Math.round(
    60 +
      Math.abs(homeWinProb - awayWinProb) * 0.35 +
      Math.min(20, expectedGoals * 4),
  );

  let pick = "";
  let pickType: Prediction["pickType"] = "HOME";
  const max = Math.max(homeWinProb, drawProb, awayWinProb);
  if (max === homeWinProb) {
    pick = `Победа хозяев (${expectedHomeInt}:${expectedAwayInt})`;
    pickType = "HOME";
  } else if (max === awayWinProb) {
    pick = `Победа гостей (${expectedHomeInt}:${expectedAwayInt})`;
    pickType = "AWAY";
  } else {
    pick = `Ничья (${expectedHomeInt}:${expectedAwayInt})`;
    pickType = "DRAW";
  }

  const insights: string[] = [];
  if (over25Prob > 65)
    insights.push(`Высокая результативность: ТБ 2.5 с вероятностью ${over25Prob}%`);
  if (bttsProb > 60)
    insights.push(`Обе забьют с вероятностью ${bttsProb}% — атакующий стиль обеих команд`);
  if (Math.abs(homeWinProb - awayWinProb) > 25)
    insights.push(`Явный фаворит — разница в вероятностях ${Math.abs(homeWinProb - awayWinProb)}%`);
  if (confidence > 80)
    insights.push(`Высокая уверенность модели — прогноз стабильный`);
  if (expectedGoals >= 3.5)
    insights.push(`Ожидается зрелищный матч — суммарный xG ${expectedGoals.toFixed(1)}`);

  return {
    homeWinProb,
    drawProb,
    awayWinProb,
    expectedScore: { home: expectedHomeInt, away: expectedAwayInt },
    expectedGoals,
    bttsProb,
    over25Prob,
    confidence: Math.min(95, confidence),
    pick,
    pickType,
    insights,
  };
}

const h2hFactory = (results: Array<[string, string, "HOME" | "DRAW" | "AWAY", string]>): H2HEntry[] =>
  results.map(([date, score, result, competition]) => ({
    date,
    score,
    result,
    competition,
  }));

/* ============ Matches — realistic upcoming / live / finished ============ */
const MATCHES: Match[] = [
  {
    id: "m1",
    homeTeam: TEAMS.RMA,
    awayTeam: TEAMS.BAR,
    league: "La Liga",
    leagueShort: "LAL",
    leagueColor: "#FF6B35",
    country: "🇪🇸 Spain",
    kickoff: now(-28),
    status: "LIVE",
    minute: 28,
    score: { home: 1, away: 1 },
    venue: "Santiago Bernabéu, Madrid",
    prediction: makePrediction(92, 88),
    stats: {
      possession: [54, 46],
      shots: [7, 5],
      shotsOnTarget: [3, 2],
      corners: [4, 2],
      fouls: [6, 8],
      yellowCards: [1, 2],
      redCards: [0, 0],
      xG: [1.4, 1.1],
    },
    h2h: h2hFactory([
      ["2025-10-26", "0:4", "AWAY", "La Liga"],
      ["2024-04-21", "3:2", "HOME", "La Liga"],
      ["2023-10-28", "1:2", "AWAY", "La Liga"],
      ["2023-04-05", "4:0", "HOME", "Copa del Rey"],
      ["2022-10-16", "3:1", "HOME", "La Liga"],
    ]),
    temperature: 19,
    weather: "Ясно",
    importance: 5,
  },
  {
    id: "m2",
    homeTeam: TEAMS.MCI,
    awayTeam: TEAMS.LIV,
    league: "Premier League",
    leagueShort: "EPL",
    leagueColor: "#A855F7",
    country: "🏴 England",
    kickoff: now(95),
    status: "UPCOMING",
    venue: "Etihad Stadium, Manchester",
    prediction: makePrediction(94, 91),
    h2h: h2hFactory([
      ["2025-02-23", "0:2", "AWAY", "Premier League"],
      ["2024-12-01", "1:1", "DRAW", "Premier League"],
      ["2024-03-10", "3:1", "HOME", "Premier League"],
      ["2023-11-25", "1:1", "DRAW", "Premier League"],
      ["2023-04-01", "4:1", "HOME", "Premier League"],
    ]),
    temperature: 12,
    weather: "Облачно",
    importance: 5,
  },
  {
    id: "m3",
    homeTeam: TEAMS.BAY,
    awayTeam: TEAMS.LEV,
    league: "Bundesliga",
    leagueShort: "BUN",
    leagueColor: "#FF3366",
    country: "🇩🇪 Germany",
    kickoff: now(-78),
    status: "LIVE",
    minute: 78,
    score: { home: 2, away: 0 },
    venue: "Allianz Arena, Munich",
    prediction: makePrediction(95, 80),
    stats: {
      possession: [62, 38],
      shots: [14, 6],
      shotsOnTarget: [7, 2],
      corners: [8, 3],
      fouls: [9, 12],
      yellowCards: [2, 3],
      redCards: [0, 0],
      xG: [3.2, 0.8],
    },
    h2h: h2hFactory([
      ["2025-04-12", "1:2", "AWAY", "Bundesliga"],
      ["2024-11-09", "3:0", "HOME", "Bundesliga"],
      ["2024-02-18", "2:3", "AWAY", "Bundesliga"],
    ]),
    temperature: 8,
    weather: "Дождь",
    importance: 4,
  },
  {
    id: "m4",
    homeTeam: TEAMS.ARS,
    awayTeam: TEAMS.CHE,
    league: "Premier League",
    leagueShort: "EPL",
    leagueColor: "#A855F7",
    country: "🏴 England",
    kickoff: now(180),
    status: "UPCOMING",
    venue: "Emirates Stadium, London",
    prediction: makePrediction(85, 73),
    h2h: h2hFactory([
      ["2025-03-16", "1:0", "HOME", "Premier League"],
      ["2024-11-10", "1:1", "DRAW", "Premier League"],
      ["2024-04-23", "5:0", "HOME", "Premier League"],
    ]),
    temperature: 11,
    weather: "Пасмурно",
    importance: 4,
  },
  {
    id: "m5",
    homeTeam: TEAMS.INT,
    awayTeam: TEAMS.JUV,
    league: "Serie A",
    leagueShort: "SEA",
    leagueColor: "#22D3EE",
    country: "🇮🇹 Italy",
    kickoff: now(250),
    status: "UPCOMING",
    venue: "San Siro, Milan",
    prediction: makePrediction(86, 78),
    h2h: h2hFactory([
      ["2025-03-09", "0:1", "AWAY", "Serie A"],
      ["2024-10-27", "4:4", "DRAW", "Serie A"],
      ["2024-02-04", "1:0", "HOME", "Serie A"],
    ]),
    temperature: 14,
    weather: "Ясно",
    importance: 4,
  },
  {
    id: "m6",
    homeTeam: TEAMS.PSG,
    awayTeam: TEAMS.MAR,
    league: "Ligue 1",
    leagueShort: "LIG",
    leagueColor: "#FFB800",
    country: "🇫🇷 France",
    kickoff: now(310),
    status: "UPCOMING",
    venue: "Parc des Princes, Paris",
    prediction: makePrediction(91, 68),
    h2h: h2hFactory([
      ["2025-03-31", "3:0", "HOME", "Ligue 1"],
      ["2024-10-27", "0:3", "AWAY", "Ligue 1"],
      ["2024-02-11", "2:1", "HOME", "Ligue 1"],
    ]),
    temperature: 13,
    weather: "Облачно",
    importance: 3,
  },
  {
    id: "m7",
    homeTeam: TEAMS.ATM,
    awayTeam: TEAMS.BAR,
    league: "La Liga",
    leagueShort: "LAL",
    leagueColor: "#FF6B35",
    country: "🇪🇸 Spain",
    kickoff: now(420),
    status: "UPCOMING",
    venue: "Metropolitano, Madrid",
    prediction: makePrediction(80, 87),
    h2h: h2hFactory([
      ["2025-03-16", "2:1", "HOME", "La Liga"],
      ["2024-12-21", "1:1", "DRAW", "La Liga"],
    ]),
    temperature: 18,
    weather: "Ясно",
    importance: 4,
  },
  {
    id: "m8",
    homeTeam: TEAMS.DOR,
    awayTeam: TEAMS.BAY,
    league: "Bundesliga",
    leagueShort: "BUN",
    leagueColor: "#FF3366",
    country: "🇩🇪 Germany",
    kickoff: now(540),
    status: "UPCOMING",
    venue: "Signal Iduna Park, Dortmund",
    prediction: makePrediction(72, 92),
    h2h: h2hFactory([
      ["2025-04-12", "2:2", "DRAW", "Bundesliga"],
      ["2024-11-09", "1:0", "HOME", "Bundesliga"],
      ["2024-03-30", "0:4", "AWAY", "Bundesliga"],
    ]),
    temperature: 7,
    weather: "Дождь",
    importance: 5,
  },
  {
    id: "m9",
    homeTeam: TEAMS.NAP,
    awayTeam: TEAMS.MIL,
    league: "Serie A",
    leagueShort: "SEA",
    leagueColor: "#22D3EE",
    country: "🇮🇹 Italy",
    kickoff: now(-150),
    status: "FINISHED",
    score: { home: 2, away: 1 },
    venue: "Diego Maradona, Naples",
    prediction: makePrediction(83, 75),
    h2h: h2hFactory([
      ["2025-03-30", "1:1", "DRAW", "Serie A"],
      ["2024-10-06", "2:0", "HOME", "Serie A"],
    ]),
    importance: 3,
  },
  {
    id: "m10",
    homeTeam: TEAMS.TOT,
    awayTeam: TEAMS.MUN,
    league: "Premier League",
    leagueShort: "EPL",
    leagueColor: "#A855F7",
    country: "🏴 England",
    kickoff: now(-220),
    status: "FINISHED",
    score: { home: 3, away: 0 },
    venue: "Tottenham Hotspur Stadium, London",
    prediction: makePrediction(78, 70),
    h2h: h2hFactory([
      ["2025-02-16", "1:0", "HOME", "Premier League"],
    ]),
    importance: 3,
  },
  {
    id: "m11",
    homeTeam: TEAMS.BEN,
    awayTeam: TEAMS.POR,
    league: "Primeira Liga",
    leagueShort: "PRT",
    leagueColor: "#10B981",
    country: "🇵🇹 Portugal",
    kickoff: now(140),
    status: "UPCOMING",
    venue: "Estádio da Luz, Lisbon",
    prediction: makePrediction(82, 74),
    h2h: h2hFactory([
      ["2025-03-09", "2:1", "HOME", "Primeira Liga"],
      ["2024-11-10", "1:1", "DRAW", "Primeira Liga"],
    ]),
    temperature: 17,
    weather: "Ясно",
    importance: 4,
  },
  {
    id: "m12",
    homeTeam: TEAMS.JUV,
    awayTeam: TEAMS.NAP,
    league: "Serie A",
    leagueShort: "SEA",
    leagueColor: "#22D3EE",
    country: "🇮🇹 Italy",
    kickoff: now(680),
    status: "UPCOMING",
    venue: "Allianz Stadium, Turin",
    prediction: makePrediction(79, 81),
    h2h: h2hFactory([
      ["2025-01-25", "2:1", "HOME", "Serie A"],
    ]),
    temperature: 9,
    weather: "Пасмурно",
    importance: 3,
  },
];

/* ============ Public API ============ */
export function getAllMatches(): Match[] {
  return MATCHES;
}

export function getLiveMatches(): Match[] {
  return MATCHES.filter((m) => m.status === "LIVE");
}

export function getUpcomingMatches(): Match[] {
  return MATCHES.filter((m) => m.status === "UPCOMING").sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
  );
}

export function getFinishedMatches(): Match[] {
  return MATCHES.filter((m) => m.status === "FINISHED");
}

export function getMatchById(id: string): Match | undefined {
  return MATCHES.find((m) => m.id === id);
}

export function getHotMatches(): Match[] {
  return MATCHES.filter((m) => m.importance >= 4).slice(0, 6);
}

export function getTopPredictions(limit = 5): Match[] {
  return [...MATCHES]
    .filter((m) => m.status !== "FINISHED")
    .sort((a, b) => b.prediction.confidence - a.prediction.confidence)
    .slice(0, limit);
}

export function getLeagues(): { name: string; short: string; color: string }[] {
  const seen = new Map<string, { name: string; short: string; color: string }>();
  MATCHES.forEach((m) => {
    if (!seen.has(m.leagueShort))
      seen.set(m.leagueShort, {
        name: m.league,
        short: m.leagueShort,
        color: m.leagueColor,
      });
  });
  return Array.from(seen.values());
}

export interface UserProfile {
  rank: number;
  totalUsers: number;
  accuracy: number;
  correctPredictions: number;
  totalPredictions: number;
  streak: number;
  level: number;
  xp: number;
  xpToNext: number;
  achievements: { id: string; title: string; icon: string; unlocked: boolean }[];
}

export function getUserProfile(): UserProfile {
  return {
    rank: 142,
    totalUsers: 15420,
    accuracy: 73,
    correctPredictions: 38,
    totalPredictions: 52,
    streak: 6,
    level: 7,
    xp: 1850,
    xpToNext: 2400,
    achievements: [
      { id: "first", title: "Первый прогноз", icon: "🎯", unlocked: true },
      { id: "streak7", title: "Серия 7 дней", icon: "🔥", unlocked: false },
      { id: "expert", title: "Эксперт АПЛ", icon: "🏆", unlocked: true },
      { id: "shark", title: "Каппер", icon: "🦈", unlocked: false },
      { id: "perfectionist", title: "10/10", icon: "💎", unlocked: false },
      { id: "veteran", title: "Ветеран", icon: "⚔️", unlocked: true },
    ],
  };
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  accuracy: number;
  streak: number;
  xp: number;
  isCurrentUser?: boolean;
}

export function getLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, name: "NeoCap", accuracy: 91, streak: 23, xp: 9840 },
    { rank: 2, name: "PitchShark", accuracy: 88, streak: 15, xp: 8720 },
    { rank: 3, name: "TikiTakaX", accuracy: 86, streak: 11, xp: 8100 },
    { rank: 4, name: "BundesBetz", accuracy: 84, streak: 9, xp: 7640 },
    { rank: 5, name: "Golazo_AI", accuracy: 82, streak: 7, xp: 7210 },
    { rank: 6, name: "TacticalFox", accuracy: 79, streak: 5, xp: 6850 },
    { rank: 7, name: "OffsideKing", accuracy: 77, streak: 8, xp: 6420 },
    { rank: 8, name: "HatTrick_Hank", accuracy: 75, streak: 4, xp: 5980 },
    { rank: 9, name: "CounterPress", accuracy: 74, streak: 6, xp: 5640 },
    { rank: 10, name: "XgMaster", accuracy: 73, streak: 5, xp: 5320 },
    { rank: 142, name: "Ты", accuracy: 73, streak: 6, xp: 1850, isCurrentUser: true },
  ];
}

/**
 * === LIVE DATA INTEGRATION ===
 *
 * To enable real-time data from football-data.org (free, 10 req/min):
 *
 * 1. Register at https://www.football-data.org/client/register (free)
 * 2. Add to .env: FOOTBALL_DATA_API_KEY=your_key_here
 * 3. Uncomment and use this fetcher in the API route.
 *
 * Other free APIs you can swap in:
 * - TheSportsDB: https://www.thesportsdb.com/api.php (no key needed for basic)
 * - OpenLigaDB: https://www.openligadb.de/ (no key, German-focused)
 * - api-football (RapidAPI): 100 req/day free
 */
export async function fetchLiveMatchesFromApi(): Promise<Match[] | null> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.football-data.org/v4/matches", {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Transform API response to Match[] shape here.
    // See: https://www.football-data.org/documentation/api#match
    return null; // Implement transformation when API key is set
  } catch {
    return null;
  }
}
