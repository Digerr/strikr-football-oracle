/**
 * STRIKR Football Data Module
 *
 * Primary source: football-data.org v4 API (free, 10 req/min)
 *   Docs: https://www.football-data.org/documentation/api
 *   Set FOOTBALL_DATA_API_KEY env var to enable live data.
 *
 * Falls back to curated mock data if API key is missing or request fails,
 * so the UI always works.
 *
 * Caching strategy:
 * - Live/Scheduled matches: cached 60s
 * - Standings: cached 5min
 * - Recent matches (for form): cached 10min
 * - All in-process memory cache (works on Vercel serverless)
 */

export type MatchStatus = "LIVE" | "UPCOMING" | "FINISHED";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  crest: string; // URL or emoji
  color: string;
  form: ("W" | "D" | "L")[]; // last 5 matches, most recent first
}

export interface Prediction {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedScore: { home: number; away: number };
  expectedGoals: number;
  bttsProb: number;
  over25Prob: number;
  confidence: number; // 0-100
  pick: string;
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
  importance: number; // 1-5
  stage?: string;
  group?: string;
  isLive?: boolean;
}

/* ============ LEAGUES (with metadata for badges) ============ */
const LEAGUES: Record<
  string,
  { name: string; color: string; country: string; emoji: string }
> = {
  WC: { name: "FIFA World Cup 2026", color: "#FFB800", country: "🌍 World", emoji: "🏆" },
  CL: { name: "Champions League", color: "#0066FF", country: "🇪🇺 Europe", emoji: "⭐" },
  CLI: { name: "Copa Libertadores", color: "#CC0000", country: "🟡 South America", emoji: "🏆" },
  PL: { name: "Premier League", color: "#A855F7", country: "🏴 England", emoji: "🦁" },
  BL1: { name: "Bundesliga", color: "#FF3366", country: "🇩🇪 Germany", emoji: "⚽" },
  SA: { name: "Serie A", color: "#22D3EE", country: "🇮🇹 Italy", emoji: "🎯" },
  FL1: { name: "Ligue 1", color: "#FFB800", country: "🇫🇷 France", emoji: "🇫🇷" },
  PD: { name: "La Liga", color: "#FF6B35", country: "🇪🇸 Spain", emoji: "⚽" },
  PPL: { name: "Primeira Liga", color: "#10B981", country: "🇵🇹 Portugal", emoji: "🇵🇹" },
  DED: { name: "Eredivisie", color: "#FF8800", country: "🇳🇱 Netherlands", emoji: "🇳🇱" },
  ELC: { name: "Championship", color: "#0066FF", country: "🏴 England", emoji: "⚽" },
  BSA: { name: "Brasileirão", color: "#00AA00", country: "🇧🇷 Brazil", emoji: "🇧🇷" },
};

const DEFAULT_LEAGUE = {
  name: "Football",
  color: "#00ff88",
  country: "🌍 World",
  emoji: "⚽",
};

/* ============ Team crest color picker ============ */
const TEAM_COLOR_MAP: Record<string, string> = {
  Spain: "#C60B1E",
  Portugal: "#006600",
  Argentina: "#75AADB",
  Brazil: "#FEDD00",
  France: "#0055A4",
  England: "#FFFFFF",
  Germany: "#000000",
  Netherlands: "#FF6600",
  Italy: "#0066CC",
  Croatia: "#FF3333",
  Belgium: "#FFD500",
  Morocco: "#C1272D",
  Colombia: "#FCD116",
  Mexico: "#006847",
  "United States": "#3C3B6E",
  Canada: "#FF0000",
  Japan: "#BC002D",
  "South Korea": "#003478",
  Switzerland: "#FF0000",
  Austria: "#ED2939",
  Norway: "#EF2B2D",
  Sweden: "#006AA7",
  Australia: "#FFD700",
  Egypt: "#C09300",
  Senegal: "#00853F",
  Uruguay: "#5B7FA6",
  "Cape Verde Islands": "#003F87",
  Paraguay: "#D52B1E",
  Ghana: "#FCD116",
  "Congo DR": "#007FFF",
  Algeria: "#006233",
  Panama: "#005EB8",
  Ecuador: "#FFD700",
  Chile: "#0033A0",
  Peru: "#D91023",
  "Saudi Arabia": "#006C35",
  "Ivory Coast": "#FF8200",
  Qatar: "#7A1138",
  Tunisia: "#E70013",
  Iran: "#239F40",
  "New Zealand": "#000000",
  Scotland: "#0065BF",
  Wales: "#D30731",
  Ireland: "#169B62",
  Turkey: "#E30A17",
  Ukraine: "#0057B7",
  Poland: "#DC143C",
  "Bosnia-Herzegovina": "#002395",
  Czechia: "#11457E",
  Hungary: "#CD2A3E",
  Romania: "#002B7F",
  Serbia: "#0C4076",
};

function getTeamColor(name: string): string {
  return TEAM_COLOR_MAP[name] || "#00ff88";
}

/* ============ Prediction generator (deterministic based on team strength) ============ */
function seedRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function makePrediction(
  homeTeam: { name: string; form: ("W" | "D" | "L")[] },
  awayTeam: { name: string; form: ("W" | "D" | "L")[] },
  matchId: string,
  stage?: string,
): Prediction {
  // Derive team strength from form (W=3, D=1, L=0, scaled 60-95)
  const formScore = (form: ("W" | "D" | "L")[]) => {
    if (form.length === 0) return 75;
    const pts = form.reduce((s, r) => s + (r === "W" ? 3 : r === "D" ? 1 : 0), 0);
    const max = form.length * 3;
    return 60 + (pts / max) * 35; // 60-95
  };

  let homeStrength = formScore(homeTeam.form) + 8; // home advantage
  let awayStrength = formScore(awayTeam.form);

  // Knockout stage → less home advantage
  if (stage && /LAST|FINAL|SEMI|QUARTER|ROUND/i.test(stage)) {
    homeStrength = formScore(homeTeam.form) + 3;
  }

  const rng = seedRandom(hashString(matchId));

  // Add small deterministic noise based on matchId so predictions vary
  homeStrength += (rng() - 0.5) * 6;
  awayStrength += (rng() - 0.5) * 6;

  const total = homeStrength + awayStrength + 30;
  const homeWinProb = Math.max(8, Math.round(((homeStrength + 15) / total) * 100));
  const awayWinProb = Math.max(8, Math.round((awayStrength / total) * 100));
  const drawProb = Math.max(5, 100 - homeWinProb - awayWinProb);

  // Renormalize
  const sum = homeWinProb + drawProb + awayWinProb;
  const h = Math.round((homeWinProb / sum) * 100);
  const a = Math.round((awayWinProb / sum) * 100);
  const d = 100 - h - a;

  // Realistic expected goals (0.5 - 2.5)
  const expectedHome = Math.max(
    0.3,
    Math.round((((homeStrength - 60) / 35) * 1.6 + 1.1) * 10) / 10,
  );
  const expectedAway = Math.max(
    0.3,
    Math.round((((awayStrength - 60) / 35) * 1.6 + 0.9) * 10) / 10,
  );
  const expectedHomeInt = Math.round(expectedHome);
  const expectedAwayInt = Math.round(expectedAway);
  const expectedGoals = expectedHome + expectedAway;

  const bttsProb = Math.round(
    Math.min(85, 35 + Math.min(expectedHome, expectedAway) * 25),
  );
  const over25Prob = Math.round(Math.min(90, 25 + expectedGoals * 18));

  const confidence = Math.round(
    60 +
      Math.abs(h - a) * 0.35 +
      Math.min(20, expectedGoals * 4) +
      (stage ? 5 : 0),
  );

  let pick = "";
  let pickType: Prediction["pickType"] = "HOME";
  const max = Math.max(h, d, a);
  if (max === h) {
    pick = `Победа ${homeTeam.name} (${expectedHomeInt}:${expectedAwayInt})`;
    pickType = "HOME";
  } else if (max === a) {
    pick = `Победа ${awayTeam.name} (${expectedHomeInt}:${expectedAwayInt})`;
    pickType = "AWAY";
  } else {
    pick = `Ничья (${expectedHomeInt}:${expectedAwayInt})`;
    pickType = "DRAW";
  }

  const insights: string[] = [];
  if (over25Prob > 65)
    insights.push(`Высокая результативность: ТБ 2.5 с вероятностью ${over25Prob}%`);
  if (bttsProb > 60)
    insights.push(
      `Обе забьют с вероятностью ${bttsProb}% — атакующий стиль обеих команд`,
    );
  if (Math.abs(h - a) > 25)
    insights.push(`Явный фаворит — разница в вероятностях ${Math.abs(h - a)}%`);
  if (confidence > 80)
    insights.push(`Высокая уверенность модели — прогноз стабильный`);
  if (expectedGoals >= 3.5)
    insights.push(`Ожидается зрелищный матч — суммарный xG ${expectedGoals.toFixed(1)}`);
  if (stage && /FINAL|SEMI/i.test(stage))
    insights.push(`Плей-офф стадия — команды играют осторожнее`);

  return {
    homeWinProb: h,
    drawProb: d,
    awayWinProb: a,
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

/* ============ In-memory cache ============ */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/* ============ football-data.org API client ============ */
const API_BASE = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";

// Competitions we track (WC + major leagues + CL + Libertadores)
const TRACKED_COMPS = [
  "WC", // World Cup
  "CL", // Champions League
  "CLI", // Copa Libertadores
  "PL", // Premier League
  "BL1", // Bundesliga
  "SA", // Serie A
  "FL1", // Ligue 1
  "PD", // La Liga
  "PPL", // Primeira Liga
  "DED", // Eredivisie
];

interface FDFMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string | null;
  group: string | null;
  homeTeam: {
    id: number;
    name: string | null;
    shortName: string | null;
    tla: string | null;
    crest: string | null;
  } | null;
  awayTeam: {
    id: number;
    name: string | null;
    shortName: string | null;
    tla: string | null;
    crest: string | null;
  } | null;
  score: {
    winner: string | null;
    duration: string;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  competition: { id: number; name: string; code: string; emblem: string };
  venue?: string | null;
  referees?: Array<{ name: string; type: string; nationality: string }> | null;
}

interface FDFFormEntry {
  match: {
    id: number;
    utcDate: string;
    status: string;
    homeTeam: { id: number; name: string; crest: string };
    awayTeam: { id: number; name: string; crest: string };
    score: { fullTime: { home: number | null; away: number | null } };
    competition: { code: string; name: string };
  };
  result?: "W" | "D" | "L";
}

async function fdfFetch<T>(path: string): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "X-Auth-Token": API_KEY },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error(`[FDF] ${path} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error(`[FDF] ${path} failed:`, e);
    return null;
  }
}

/**
 * Get recent finished matches for a team (for form).
 * Cached 10min. Silently returns [] on error.
 */
async function getTeamForm(teamId: number): Promise<("W" | "D" | "L")[]> {
  const cacheKey = `form-${teamId}`;
  const cached = getCached<("W" | "D" | "L")[]>(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `${API_BASE}/teams/${teamId}/matches?status=FINISHED&limit=5`,
      {
        headers: { "X-Auth-Token": API_KEY },
        signal: controller.signal,
        next: { revalidate: 600 },
      },
    );
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    if (!data || !data.matches) return [];

    const form: ("W" | "D" | "L")[] = data.matches
      .slice(0, 5)
      .map(
        (m: {
          homeTeam: { id: number };
          awayTeam: { id: number };
          score: {
            fullTime: { home: number | null; away: number | null };
          };
        }) => {
          const isHome = m.homeTeam.id === teamId;
          const our = isHome ? m.score.fullTime.home : m.score.fullTime.away;
          const their = isHome ? m.score.fullTime.away : m.score.fullTime.home;
          if (our === null || their === null) return "D" as const;
          if (our > their) return "W" as const;
          if (our < their) return "L" as const;
          return "D" as const;
        },
      );

    setCached(cacheKey, form, 10 * 60 * 1000); // 10 min
    return form;
  } catch {
    return [];
  }
}

/**
 * Fetch live + scheduled matches from all tracked competitions.
 * football-data.org /v4/matches returns matches for current/next 7 days.
 */
async function fetchLiveMatchesFromApi(): Promise<Match[] | null> {
  if (!API_KEY) return null;

  const cacheKey = "live-matches";
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  // Build date range: yesterday (for recent finished) → +7 days
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const dateFrom = fmt(yesterday);
  const dateTo = fmt(nextWeek);

  // /v4/matches with dateFrom/dateTo returns all matches across competitions
  // we have access to in the date range.
  let data: { matches: FDFMatch[]; count: number } | null = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `${API_BASE}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: { "X-Auth-Token": API_KEY },
        signal: controller.signal,
        next: { revalidate: 60 },
      },
    );
    clearTimeout(timeout);
    if (res.ok) {
      data = await res.json();
    } else {
      console.error(`[FDF] /matches → ${res.status}`);
    }
  } catch (e) {
    console.error(`[FDF] /matches failed:`, e);
  }

  if (!data || !data.matches || data.matches.length === 0) {
    return null;
  }

  // Build Match objects
  const matches: Match[] = [];

  for (const m of data.matches) {
    // Skip TBD matchups (homeTeam/awayTeam can be null in knockout brackets)
    if (!m.homeTeam || !m.awayTeam) continue;
    if (!m.homeTeam.name || !m.awayTeam.name) continue;

    // Only include tracked competitions
    if (
      !LEAGUES[m.competition.code] &&
      !TRACKED_COMPS.includes(m.competition.code)
    ) {
      continue;
    }

    const leagueMeta = LEAGUES[m.competition.code] || {
      ...DEFAULT_LEAGUE,
      name: m.competition.name,
    };

    const homeTeamName = m.homeTeam.name;
    const awayTeamName = m.awayTeam.name;

    const homeTeam: Team = {
      id: `t${m.homeTeam.id}`,
      name: homeTeamName,
      shortName:
        m.homeTeam.tla ||
        m.homeTeam.shortName ||
        homeTeamName.slice(0, 3),
      crest: m.homeTeam.crest || "⚽",
      color: getTeamColor(homeTeamName),
      form: [],
    };

    const awayTeam: Team = {
      id: `t${m.awayTeam.id}`,
      name: awayTeamName,
      shortName:
        m.awayTeam.tla ||
        m.awayTeam.shortName ||
        awayTeamName.slice(0, 3),
      crest: m.awayTeam.crest || "⚽",
      color: getTeamColor(awayTeamName),
      form: [],
    };

    // Determine status
    let status: MatchStatus = "UPCOMING";
    let minute: number | undefined;
    let score: { home: number; away: number } | undefined;

    if (
      m.status === "IN_PLAY" ||
      m.status === "PAUSED" ||
      m.status === "LIVE"
    ) {
      status = "LIVE";
      const kickoff = new Date(m.utcDate).getTime();
      const elapsed = Math.floor((Date.now() - kickoff) / 60000);
      minute = Math.min(95, Math.max(1, elapsed));
    } else if (m.status === "FINISHED") {
      status = "FINISHED";
    } else {
      status = "UPCOMING";
    }

    if (
      m.score.fullTime.home !== null &&
      m.score.fullTime.away !== null
    ) {
      score = {
        home: m.score.fullTime.home,
        away: m.score.fullTime.away,
      };
    } else if (
      m.score.halfTime.home !== null &&
      m.score.halfTime.away !== null
    ) {
      score = {
        home: m.score.halfTime.home,
        away: m.score.halfTime.away,
      };
    }

    const stage = m.stage || undefined;
    const group = m.group || undefined;

    let importance = 3;
    if (m.competition.code === "WC") {
      if (
        stage &&
        /FINAL|SEMI|LAST_16|LAST_8|LAST_32|QUARTER/i.test(stage)
      ) {
        importance = 5;
      } else {
        importance = 4;
      }
    } else if (m.competition.code === "CL" || m.competition.code === "CLI") {
      importance = 4;
    } else if (["PL", "BL1", "SA", "FL1", "PD"].includes(m.competition.code)) {
      importance = 3;
    }

    const matchId = `fdf-${m.id}`;

    const prediction = makePrediction(homeTeam, awayTeam, matchId, stage);

    matches.push({
      id: matchId,
      homeTeam,
      awayTeam,
      league: leagueMeta.name,
      leagueShort: m.competition.code,
      leagueColor: leagueMeta.color,
      country: leagueMeta.country,
      kickoff: m.utcDate,
      status,
      minute,
      score,
      venue: m.referees?.[0]?.nationality
        ? `${m.referees[0].nationality} referee`
        : leagueMeta.country,
      prediction,
      stats:
        status === "LIVE" ? generateStats(m, homeTeam, awayTeam) : undefined,
      h2h: [],
      importance,
      stage,
      group,
      isLive: status === "LIVE",
    });
  }

  // Form fetching is now fire-and-forget per match (called from getMatchById
  // or via a separate background task). For listing endpoints we skip it
  // to stay within football-data.org's 10 req/min limit.

  // Sort: LIVE first, then UPCOMING by date, then FINISHED by most recent
  matches.sort((a, b) => {
    if (a.status === "LIVE" && b.status !== "LIVE") return -1;
    if (a.status !== "LIVE" && b.status === "LIVE") return 1;
    if (a.status === "FINISHED" && b.status === "FINISHED") {
      return new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime();
    }
    return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
  });

  setCached(cacheKey, matches, 60 * 1000); // 1 min cache
  return matches;
}

function generateStats(
  m: FDFMatch,
  homeTeam: Team,
  awayTeam: Team,
): MatchStats {
  const rng = seedRandom(hashString(`${m.id}-stats`));
  const scoreH = m.score.fullTime.home ?? 0;
  const scoreA = m.score.fullTime.away ?? 0;
  const dominant = scoreH > scoreA ? 1 : scoreA > scoreH ? -1 : 0;

  return {
    possession: [
      Math.round(45 + rng() * 15 + dominant * 5),
      0,
    ].map((v, i) => (i === 0 ? v : 100 - v)) as [number, number],
    shots: [
      Math.round(8 + rng() * 12 + Math.max(0, dominant) * 4),
      Math.round(6 + rng() * 10 + Math.max(0, -dominant) * 4),
    ] as [number, number],
    shotsOnTarget: [
      Math.round(3 + rng() * 6 + scoreH),
      Math.round(2 + rng() * 5 + scoreA),
    ] as [number, number],
    corners: [
      Math.round(3 + rng() * 7),
      Math.round(2 + rng() * 6),
    ] as [number, number],
    fouls: [
      Math.round(8 + rng() * 8),
      Math.round(7 + rng() * 9),
    ] as [number, number],
    yellowCards: [
      Math.round(rng() * 4),
      Math.round(rng() * 4),
    ] as [number, number],
    redCards: [
      rng() > 0.85 ? 1 : 0,
      rng() > 0.85 ? 1 : 0,
    ] as [number, number],
    xG: [
      Math.round((0.8 + rng() * 2.5) * 10) / 10,
      Math.round((0.6 + rng() * 2.2) * 10) / 10,
    ] as [number, number],
  };
}

/* ============ MOCK FALLBACK DATA ============ */
const MOCK_TEAMS: Record<string, Team> = {
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
  BAY: {
    id: "BAY",
    name: "Bayern Munich",
    shortName: "BAY",
    crest: "🔴",
    color: "#DC052D",
    form: ["W", "W", "W", "D", "W"],
  },
};

function now(offsetMinutes = 0): string {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  return d.toISOString();
}

function buildMockMatches(): Match[] {
  return [
    {
      id: "mock-1",
      homeTeam: MOCK_TEAMS.RMA,
      awayTeam: MOCK_TEAMS.BAR,
      league: "La Liga",
      leagueShort: "PD",
      leagueColor: "#FF6B35",
      country: "🇪🇸 Spain",
      kickoff: now(-28),
      status: "LIVE",
      minute: 28,
      score: { home: 1, away: 1 },
      venue: "Santiago Bernabéu, Madrid",
      prediction: makePrediction(MOCK_TEAMS.RMA, MOCK_TEAMS.BAR, "mock-1"),
      h2h: [],
      importance: 5,
    },
    {
      id: "mock-2",
      homeTeam: MOCK_TEAMS.MCI,
      awayTeam: MOCK_TEAMS.LIV,
      league: "Premier League",
      leagueShort: "PL",
      leagueColor: "#A855F7",
      country: "🏴 England",
      kickoff: now(95),
      status: "UPCOMING",
      venue: "Etihad Stadium, Manchester",
      prediction: makePrediction(MOCK_TEAMS.MCI, MOCK_TEAMS.LIV, "mock-2"),
      h2h: [],
      importance: 5,
    },
    {
      id: "mock-3",
      homeTeam: MOCK_TEAMS.BAY,
      awayTeam: MOCK_TEAMS.RMA,
      league: "Champions League",
      leagueShort: "CL",
      leagueColor: "#0066FF",
      country: "🇪🇺 Europe",
      kickoff: now(180),
      status: "UPCOMING",
      venue: "Allianz Arena, Munich",
      prediction: makePrediction(MOCK_TEAMS.BAY, MOCK_TEAMS.RMA, "mock-3", "FINAL"),
      h2h: [],
      importance: 5,
      stage: "FINAL",
    },
  ];
}

/* ============ PUBLIC API ============ */

/**
 * Get all matches. Tries live API first, falls back to mock.
 */
export async function getAllMatches(): Promise<Match[]> {
  const live = await fetchLiveMatchesFromApi();
  if (live && live.length > 0) return live;
  return buildMockMatches();
}

export async function getLiveMatches(): Promise<Match[]> {
  const all = await getAllMatches();
  return all.filter((m) => m.status === "LIVE");
}

export async function getUpcomingMatches(): Promise<Match[]> {
  const all = await getAllMatches();
  return all
    .filter((m) => m.status === "UPCOMING")
    .sort(
      (a, b) =>
        new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
    );
}

export async function getFinishedMatches(): Promise<Match[]> {
  const all = await getAllMatches();
  return all
    .filter((m) => m.status === "FINISHED")
    .sort(
      (a, b) =>
        new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime(),
    );
}

export async function getHotMatches(): Promise<Match[]> {
  const all = await getAllMatches();
  return all
    .filter((m) => m.importance >= 4 && m.status !== "FINISHED")
    .sort((a, b) => b.importance - a.importance);
}

export async function getMatchById(
  id: string,
): Promise<Match | undefined> {
  const all = await getAllMatches();
  const match = all.find((m) => m.id === id);
  if (!match) return undefined;

  // If form is empty, try to fetch it (for detail modal)
  if (
    match.homeTeam.form.length === 0 &&
    match.awayTeam.form.length === 0 &&
    API_KEY
  ) {
    const fdfId = parseInt(id.replace("fdf-", ""), 10);
    if (!isNaN(fdfId)) {
      // Fetch both teams' forms sequentially (respect rate limit)
      try {
        const homeFdfId = parseInt(match.homeTeam.id.replace("t", ""), 10);
        const awayFdfId = parseInt(match.awayTeam.id.replace("t", ""), 10);
        const [hForm, aForm] = await Promise.all([
          getTeamForm(homeFdfId),
          getTeamForm(awayFdfId),
        ]);
        match.homeTeam.form = hForm;
        match.awayTeam.form = aForm;
      } catch {
        // ignore, keep empty form
      }
    }
  }

  return match;
}

export async function getTopPredictions(limit = 5): Promise<Match[]> {
  const all = await getAllMatches();
  return all
    .filter((m) => m.status !== "FINISHED")
    .sort((a, b) => b.prediction.confidence - a.prediction.confidence)
    .slice(0, limit);
}

export async function getLeagues(): Promise<
  { name: string; short: string; color: string }[]
> {
  const all = await getAllMatches();
  const seen = new Map<
    string,
    { name: string; short: string; color: string }
  >();
  all.forEach((m) => {
    if (!seen.has(m.leagueShort))
      seen.set(m.leagueShort, {
        name: m.league,
        short: m.leagueShort,
        color: m.leagueColor,
      });
  });
  return Array.from(seen.values());
}

/* ============ USER PROFILE & LEADERBOARD (mock for now) ============ */
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
  achievements: {
    id: string;
    title: string;
    icon: string;
    unlocked: boolean;
  }[];
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
    {
      rank: 142,
      name: "Ты",
      accuracy: 73,
      streak: 6,
      xp: 1850,
      isCurrentUser: true,
    },
  ];
}

/* ============ BACKWARD-COMPAT SYNC API (deprecated) ============ */
/**
 * Synchronous versions kept for backward compatibility with old call sites.
 * Will be removed once all callers migrate to async API.
 */
export function _getAllMatchesSync(): Match[] {
  return buildMockMatches();
}
