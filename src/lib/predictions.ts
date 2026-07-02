/**
 * STRIKR — Predictions Aggregator Data Layer
 *
 * Aggregates predictions from public sports betting prediction sites:
 * - Stavka.tv (primary, public predictions page)
 * - More sources can be plugged in via the Source interface
 *
 * Caching: in-memory, refreshed by /api/cron/refresh every 30 min.
 */

/* ============ Types ============ */

export type SportType = "football" | "hockey" | "tennis" | "basketball" | "esports" | "other";

export type PredictionStatus = "pending" | "won" | "lost" | "void" | "canceled";

export type BetType =
  | "1" | "X" | "2" | "1X" | "12" | "X2" // 1X2 markets
  | "TB" | "TM" // total over/under
  | "BTTS_YES" | "BTTS_NO" // both teams to score
  | "HANDICAP" // asian handicap
  | "DOUBLE_CHANCE"
  | "OTHER";

export interface Capper {
  id: string; // unique slug (e.g. "viktor-loginov-2")
  name: string;
  slug?: string;
  avatar?: string; // URL
  source: string; // "stavka.tv", "sports.ru", etc.
  bookmaker?: string; // current ambassador bookmaker (e.g. "Леон")
  sourceUrl?: string; // profile URL
  // Stats (computed from predictions or from source)
  roi?: number; // return on investment, %
  accuracy?: number; // win rate, %
  streak?: number; // current win streak
  totalPredictions?: number;
  profit30d?: number; // profit in units last 30 days
  followers?: number;
  verified?: boolean;
}

export interface Prediction {
  id: string;
  capper: Capper;
  // Match info
  matchTitle: string; // "Португалия - Хорватия"
  homeTeam: string;
  awayTeam: string;
  kickoff: string; // ISO date string (computed from "23:00 2 июл")
  matchUrl?: string; // source match URL
  league?: string;
  sport: SportType;
  // Bet info
  betType: BetType;
  betLabel: string; // human-readable: "Тотал меньше 2.5", "Победа П1", etc.
  odds: number; // 1.80
  bookmaker?: string; // "Леон", "PARI"
  // Content
  argumentation: string; // capper's reasoning
  confidence: number; // 1-10 derived from odds + capper's track record
  // Meta
  publishedAt: string; // ISO date
  source: string; // "stavka.tv"
  sourceUrl?: string; // direct link to prediction on source site
  status: PredictionStatus;
  // Social
  likes?: number;
  comments?: number;
  repeats?: number;
}

export interface Express {
  id: string;
  capper: Capper;
  title: string;
  legs: Array<{
    matchTitle: string;
    betLabel: string;
    odds: number;
  }>;
  totalOdds: number;
  stake?: number;
  publishedAt: string;
  source: string;
  sourceUrl?: string;
  status: PredictionStatus;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  sport: SportType;
  league?: string;
  leagueShort?: string;
  leagueColor?: string;
  country?: string;
  predictionsCount: number;
  topOdds?: number;
  sourceUrl?: string;
}

/* ============ Sources config ============ */

export interface SourceConfig {
  id: string;
  name: string;
  url: string;
  favicon: string;
  color: string;
}

export const SOURCES: SourceConfig[] = [
  {
    id: "stavka.tv",
    name: "Stavka.tv",
    url: "https://stavka.tv",
    favicon: "https://stavka.tv/apple-touch-icon.png",
    color: "#0161da",
  },
  {
    id: "sports.ru",
    name: "Sports.ru",
    url: "https://www.sports.ru",
    favicon: "https://www.sports.ru/favicon.ico",
    color: "#d71a2f",
  },
  {
    id: "championat.com",
    name: "Championat.com",
    url: "https://www.championat.com",
    favicon: "https://www.championat.com/favicon.ico",
    color: "#ff6b00",
  },
  {
    id: "vseprosport.ru",
    name: "Vseprosport.ru",
    url: "https://vseprosport.ru",
    favicon: "https://vseprosport.ru/favicon.ico",
    color: "#22a443",
  },
  {
    id: "flashscore.ru",
    name: "Flashscore.ru",
    url: "https://www.flashscore.ru",
    favicon: "https://www.flashscore.ru/favicon.ico",
    color: "#f2b100",
  },
];

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

/* ============ Stavka.tv parser ============ */

const STAVKA_BASE = "https://stavka.tv";

/**
 * Parse "Вчера в 01:49 по МСК" or "Сегодня в 14:30 по МСК" or "2 июл в 18:00"
 * into ISO date string.
 */
function parseStavkaDate(text: string): string {
  const now = new Date();
  const cleaned = text.replace("по МСК", "").trim();

  // "Вчера в HH:MM"
  let m = cleaned.match(/Вчера в (\d{1,2}):(\d{2})/i);
  if (m) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
    return d.toISOString();
  }

  // "Сегодня в HH:MM"
  m = cleaned.match(/Сегодня в (\d{1,2}):(\d{2})/i);
  if (m) {
    const d = new Date(now);
    d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
    return d.toISOString();
  }

  // "X мин назад" / "X час назад"
  m = cleaned.match(/(\d+)\s*мин\s*назад/i);
  if (m) {
    return new Date(now.getTime() - parseInt(m[1], 10) * 60_000).toISOString();
  }
  m = cleaned.match(/(\d+)\s*час\s*назад/i);
  if (m) {
    return new Date(now.getTime() - parseInt(m[1], 10) * 3_600_000).toISOString();
  }

  // "D MMM в HH:MM" — e.g. "2 июл в 18:00"
  const months: Record<string, number> = {
    янв: 0, фев: 1, мар: 2, апр: 3, мая: 4, май: 4, июн: 5,
    июл: 6, авг: 7, сен: 8, окт: 9, ноя: 10, дек: 11,
  };
  m = cleaned.match(/(\d+)\s+([а-яё]{3,})\s+в\s+(\d{1,2}):(\d{2})/i);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthName = m[2].toLowerCase().slice(0, 3);
    const month = months[monthName] ?? now.getMonth();
    const hour = parseInt(m[3], 10);
    const min = parseInt(m[4], 10);
    const d = new Date(now.getFullYear(), month, day, hour, min, 0, 0);
    // If parsed date is more than 6 months in the future, assume last year
    if (d.getTime() - now.getTime() > 180 * 24 * 3600_000) {
      d.setFullYear(d.getFullYear() - 1);
    }
    return d.toISOString();
  }

  return now.toISOString();
}

/**
 * Compute kickoff ISO from "23:00 2 июл" style strings.
 */
function parseStavkaKickoff(timeStr: string, dayStr?: string): string {
  const now = new Date();
  const months: Record<string, number> = {
    янв: 0, фев: 1, мар: 2, апр: 3, мая: 4, май: 4, июн: 5,
    июл: 6, авг: 7, сен: 8, окт: 9, ноя: 10, дек: 11,
  };

  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) return now.toISOString();
  const hour = parseInt(timeMatch[1], 10);
  const min = parseInt(timeMatch[2], 10);

  let day = now.getDate();
  let month = now.getMonth();
  let year = now.getFullYear();

  if (dayStr) {
    const dm = dayStr.match(/(\d+)\s+([а-яё]{3,})/i);
    if (dm) {
      day = parseInt(dm[1], 10);
      const mn = dm[2].toLowerCase().slice(0, 3);
      month = months[mn] ?? month;
    }
  }

  const d = new Date(year, month, day, hour, min, 0, 0);
  // If kickoff is more than 1 day in the past, assume it's upcoming (next occurrence)
  if (d.getTime() - now.getTime() < -24 * 3600_000) {
    // Already passed — keep it (could be a recent finished match)
  }
  return d.toISOString();
}

/**
 * Convert "ТОТАЛ МЕНЬШЕ (2.5)" → { betType: "TM", betLabel: "Тотал меньше 2.5" }
 */
function parseBetType(outcome: string): { betType: BetType; betLabel: string } {
  const upper = outcome.toUpperCase().trim().replace(/\.$/, "");
  const label = outcome.trim().replace(/\.$/, "").replace(/\s*\(\d+(\.\d+)?\)\s*$/, m => ` ${m.slice(1, -1)}`).trim();

  if (/ТОТАЛ\s*МЕНЬШЕ|ТМ/i.test(outcome)) {
    return { betType: "TM", betLabel: label };
  }
  if (/ТОТАЛ\s*БОЛЬШЕ|ТБ/i.test(outcome)) {
    return { betType: "TB", betLabel: label };
  }
  if (/ОБЕ\s*ЗАБЬЮТ/i.test(outcome)) {
    return { betType: /ДА/i.test(outcome) ? "BTTS_YES" : "BTTS_NO", betLabel: label };
  }
  if (/ПОБЕДА\s*1|П1/i.test(outcome)) {
    return { betType: "1", betLabel: label };
  }
  if (/ПОБЕДА\s*2|П2/i.test(outcome)) {
    return { betType: "2", betLabel: label };
  }
  if (/НИЧЬЯ|Х/i.test(outcome)) {
    return { betType: "X", betLabel: label };
  }
  if (/ФОРА/i.test(outcome)) {
    return { betType: "HANDICAP", betLabel: label };
  }
  if (/ДВОЙНОЙ\s*ШАНС|1X|12|X2/i.test(outcome)) {
    return { betType: "DOUBLE_CHANCE", betLabel: label };
  }
  return { betType: "OTHER", betLabel: label };
}

/**
 * Compute confidence 1-10 from odds + heuristic.
 * Lower odds → higher confidence (capper expects it to happen).
 */
function computeConfidence(odds: number): number {
  if (odds <= 1.3) return 9;
  if (odds <= 1.5) return 8;
  if (odds <= 1.7) return 7;
  if (odds <= 1.9) return 6;
  if (odds <= 2.2) return 5;
  if (odds <= 2.6) return 4;
  if (odds <= 3.0) return 3;
  if (odds <= 4.0) return 2;
  return 1;
}

function detectSport(classHint: string): SportType {
  if (/soccer|football/i.test(classHint)) return "football";
  if (/hockey/i.test(classHint)) return "hockey";
  if (/tennis/i.test(classHint)) return "tennis";
  if (/basketball|basket/i.test(classHint)) return "basketball";
  if (/esport|cyber/i.test(classHint)) return "esports";
  return "other";
}

/**
 * HTML-stripped text helper. Removes tags, decodes entities, trims whitespace.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract all prediction cards from Stavka.tv HTML.
 * Each card has classes: PredictionsItem PredictionsItem--{status} PredictionsItem--{sport} prediction
 */
function extractStavkaPredictions(html: string): Prediction[] {
  const predictions: Prediction[] = [];

  // Match each prediction card. Card structure:
  // <div class="PredictionsItem PredictionsItem--coming PredictionsItem--soccer prediction">...</div>
  // We split by this marker.
  const cardRegex = /<div class="PredictionsItem\s+PredictionsItem--(\w+)\s+PredictionsItem--(\w+)\s+prediction"[^>]*>([\s\S]*?)(?=<div class="PredictionsItem\s+PredictionsItem|$)/g;
  let match;
  let count = 0;
  while ((match = cardRegex.exec(html)) !== null && count < 100) {
    const statusRaw = match[1]; // "coming", "win", "lose", "canceled"
    const sportClass = match[2]; // "soccer", "hockey", etc.
    const cardHtml = match[3];

    try {
      // Capper name
      const fullNameMatch = cardHtml.match(/<span class="full-name"[^>]*>([^<]+)<\/span>/);
      const capperName = fullNameMatch ? fullNameMatch[1].trim() : "Аноним";

      // Capper profile link
      const predictorLinkMatch = cardHtml.match(/<a href="\/predictors\/([^"]+)"[^>]*class="predictor-link"/);
      const capperSlug = predictorLinkMatch ? predictorLinkMatch[1] : "";
      const capperId = capperSlug || `stavka-${count}`;

      // Bookmaker (ambassador)
      const bkMatch = cardHtml.match(/<span class="bk-name"[^>]*>([^<]+)<\/span>/);
      const bookmaker = bkMatch ? bkMatch[1].trim() : undefined;

      // Publish date
      const dateMatch = cardHtml.match(/<div class="date"[^>]*>([^<]+)<\/div>/);
      const publishedAt = dateMatch ? parseStavkaDate(dateMatch[1]) : new Date().toISOString();

      // Match info
      const homeTeamMatch = cardHtml.match(/<span[^>]*class="text-slogan team team--home"[^>]*>([^<]+)<\/span>/);
      const awayTeamMatch = cardHtml.match(/<span[^>]*class="text-slogan team team--away"[^>]*>([^<]+)<\/span>/);
      const homeTeam = homeTeamMatch ? homeTeamMatch[1].trim() : "";
      const awayTeam = awayTeamMatch ? awayTeamMatch[1].trim() : "";
      const matchTitle = homeTeam && awayTeam ? `${homeTeam} - ${awayTeam}` : "—";

      // Match time + day
      const timeMatch = cardHtml.match(/<span class="date__time"[^>]*>([^<]+)<\/span>/);
      const dayMatch = cardHtml.match(/<span class="date__day"[^>]*>([^<]+)<\/span>/);
      const kickoff = timeMatch
        ? parseStavkaKickoff(timeMatch[1], dayMatch?.[1])
        : new Date().toISOString();

      // Match URL
      const matchUrlMatch = cardHtml.match(/<a href="(\/matches\/[^"]+)"[^>]*class="PredictionsItemEvent/);
      const matchUrl = matchUrlMatch ? `${STAVKA_BASE}${matchUrlMatch[1]}` : undefined;

      // Coefficient - format: '<!----> 1.80' inside Rate div
      const rateMatch = cardHtml.match(/<div class="Rate[^"]*"[^>]*>(?:<!---->)?\s*([\d.]+)\s*<\/div>/);
      const odds = rateMatch ? parseFloat(rateMatch[1]) : 0;

      // Bet outcome (the bet itself)
      const outcomeMatch = cardHtml.match(/<span class="outcome"[^>]*>([^<]+)<\/span>/);
      const outcomeText = outcomeMatch ? outcomeMatch[1].trim() : "";
      const { betType, betLabel } = parseBetType(outcomeText);

      // Argumentation (prediction text)
      const textMatch = cardHtml.match(/<div class="prediction-text[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<div class="Reactions/);
      let argumentation = "";
      if (textMatch) {
        // Strip "ПРОГНОЗ: ... за коэффициент ..." footer from text
        argumentation = textMatch[1]
          .replace(/<p><strong>ПРОГНОЗ:.*?<\/strong><\/p>/g, "")
          .replace(/<div class="nomobile".*?<\/div>/g, "");
        argumentation = stripHtml(argumentation);
      }

      // Likes (reactions)
      const likesMatch = cardHtml.match(/<button[^>]*class="[^"]*ReactionsButton--counter[^"]*"[^>]*>[\s\S]*?<span class="counter">[\s\S]*?(\d+)[\s\S]*?<\/span>/);
      const likes = likesMatch ? parseInt(likesMatch[1], 10) : 0;

      // Comments
      const commentsMatch = cardHtml.match(/button-comments[\s\S]*?(\d+)/);
      const comments = commentsMatch ? parseInt(commentsMatch[1], 10) : 0;

      // Status
      let status: PredictionStatus = "pending";
      if (statusRaw === "win") status = "won";
      else if (statusRaw === "lose") status = "lost";
      else if (statusRaw === "canceled" || statusRaw === "void") status = "void";

      const prediction: Prediction = {
        id: `stavka-${capperId}-${count}`,
        capper: {
          id: capperId,
          name: capperName,
          slug: capperSlug,
          source: "stavka.tv",
          sourceUrl: capperSlug ? `${STAVKA_BASE}/predictors/${capperSlug}` : undefined,
          bookmaker,
          verified: true,
        },
        matchTitle,
        homeTeam,
        awayTeam,
        kickoff,
        matchUrl,
        sport: detectSport(sportClass),
        betType,
        betLabel,
        odds,
        bookmaker,
        argumentation,
        confidence: computeConfidence(odds),
        publishedAt,
        source: "stavka.tv",
        sourceUrl: matchUrl,
        status,
        likes,
        comments,
      };

      // Skip if no bet info at all
      if (odds > 0 || outcomeText) {
        predictions.push(prediction);
      }
    } catch (e) {
      console.error("[stavka] card parse error:", e);
    }
    count++;
  }

  return predictions;
}

/* ============ Fetcher with timeout ============ */

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ru-RU,ru;q=0.9",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    console.error(`[fetch] ${url} failed:`, e);
    return null;
  }
}

/* ============ Main fetcher: stavka.tv ============ */

async function fetchStavkaPredictions(): Promise<Prediction[]> {
  const cacheKey = "stavka-predictions";
  const cached = getCached<Prediction[]>(cacheKey);
  if (cached) return cached;

  const html = await fetchWithTimeout(`${STAVKA_BASE}/predictions`);
  if (!html) return [];

  const predictions = extractStavkaPredictions(html);
  setCached(cacheKey, predictions, 5 * 60 * 1000); // 5 min cache
  return predictions;
}

/* ============ Public API ============ */

export async function getAllPredictions(): Promise<Prediction[]> {
  return fetchStavkaPredictions();
}

export async function getPredictionsForMatch(matchId: string): Promise<Prediction[]> {
  // matchId format: "home-vs-away" or URL slug
  const all = await getAllPredictions();
  return all.filter((p) => {
    const slug = `${p.homeTeam.toLowerCase().replace(/\s+/g, "-")}-vs-${p.awayTeam.toLowerCase().replace(/\s+/g, "-")}`;
    return slug.includes(matchId.toLowerCase()) || p.matchUrl?.includes(matchId);
  });
}

export async function getTopCappers(limit = 20): Promise<Capper[]> {
  const predictions = await getAllPredictions();
  const capperMap = new Map<string, Capper>();

  // Aggregate predictions per capper
  const capperPredictions = new Map<string, Prediction[]>();
  predictions.forEach((p) => {
    const arr = capperPredictions.get(p.capper.id) || [];
    arr.push(p);
    capperPredictions.set(p.capper.id, arr);
    if (!capperMap.has(p.capper.id)) {
      capperMap.set(p.capper.id, p.capper);
    }
  });

  // Compute stats per capper
  const cappers: Capper[] = [];
  capperMap.forEach((capper, id) => {
    const preds = capperPredictions.get(id) || [];
    const settled = preds.filter((p) => p.status === "won" || p.status === "lost");
    const won = preds.filter((p) => p.status === "won").length;
    const lost = preds.filter((p) => p.status === "lost").length;

    // Profit = sum of (odds-1) for wins, minus 1 for losses
    const profit = preds.reduce((sum, p) => {
      if (p.status === "won") return sum + (p.odds - 1);
      if (p.status === "lost") return sum - 1;
      return sum;
    }, 0);

    // Streak: count consecutive wins from the end of settled predictions
    let streak = 0;
    for (let i = settled.length - 1; i >= 0; i--) {
      if (settled[i].status === "won") streak++;
      else break;
    }

    // ROI: profit / total staked (assume 1 unit per bet)
    const totalStaked = settled.length;
    const roi = totalStaked > 0 ? Math.round((profit / totalStaked) * 100) : 0;
    const accuracy = settled.length > 0 ? Math.round((won / settled.length) * 100) : 0;

    cappers.push({
      ...capper,
      totalPredictions: preds.length,
      roi,
      accuracy,
      streak,
      profit30d: Math.round(profit * 10) / 10,
    });
  });

  // Sort by ROI (descending), then by total predictions
  cappers.sort((a, b) => (b.roi || 0) - (a.roi || 0) || (b.totalPredictions || 0) - (a.totalPredictions || 0));

  return cappers.slice(0, limit);
}

export async function getCapperById(id: string): Promise<{ capper: Capper; predictions: Prediction[] } | null> {
  const all = await getAllPredictions();
  const capperPreds = all.filter((p) => p.capper.id === id || p.capper.slug === id);
  if (capperPreds.length === 0) return null;

  const capper = capperPreds[0].capper;
  const cappers = await getTopCappers(1000);
  const capperWithStats = cappers.find((c) => c.id === id || c.slug === id) || capper;

  return { capper: capperWithStats, predictions: capperPreds };
}

export async function getMatches(): Promise<Match[]> {
  const predictions = await getAllPredictions();
  const matchMap = new Map<string, Match>();

  predictions.forEach((p) => {
    const key = p.matchTitle;
    if (!matchMap.has(key)) {
      const sportLabels: Record<SportType, string> = {
        football: "Футбол",
        hockey: "Хоккей",
        tennis: "Теннис",
        basketball: "Баскетбол",
        esports: "Киберспорт",
        other: "Другое",
      };
      const sportColors: Record<SportType, string> = {
        football: "#22a443",
        hockey: "#0161da",
        tennis: "#f2b100",
        basketball: "#ff6b00",
        esports: "#5e36ca",
        other: "#64748b",
      };
      matchMap.set(key, {
        id: key.toLowerCase().replace(/\s+-\s+/g, "-vs-").replace(/\s+/g, "-"),
        homeTeam: p.homeTeam,
        awayTeam: p.awayTeam,
        kickoff: p.kickoff,
        sport: p.sport,
        league: sportLabels[p.sport],
        leagueShort: sportLabels[p.sport].slice(0, 3).toUpperCase(),
        leagueColor: sportColors[p.sport],
        country: "—",
        predictionsCount: 0,
        topOdds: 0,
        sourceUrl: p.matchUrl,
      });
    }
    const m = matchMap.get(key)!;
    m.predictionsCount++;
    if (p.odds > m.topOdds!) m.topOdds = p.odds;
  });

  // Sort by predictions count (most predictions first), then by kickoff
  return Array.from(matchMap.values())
    .sort((a, b) => b.predictionsCount - a.predictionsCount || new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
}

export async function getExpresses(): Promise<Express[]> {
  // For now, generate "express" by grouping predictions on same match from different cappers
  // Real expresses would come from a dedicated source page
  const predictions = await getAllPredictions();
  const matchGroups = new Map<string, Prediction[]>();
  predictions.forEach((p) => {
    const arr = matchGroups.get(p.matchTitle) || [];
    arr.push(p);
    matchGroups.set(p.matchTitle, arr);
  });

  const expresses: Express[] = [];
  matchGroups.forEach((preds, matchTitle) => {
    if (preds.length < 2) return;
    // Top 3 predictions by confidence
    const top = [...preds].sort((a, b) => b.confidence - a.confidence).slice(0, 3);
    if (top.length < 2) return;

    const totalOdds = top.reduce((prod, p) => prod * p.odds, 1);
    expresses.push({
      id: `express-${matchTitle.toLowerCase().replace(/\s+/g, "-")}`,
      capper: top[0].capper, // lead capper
      title: `Экспресс на ${matchTitle}`,
      legs: top.map((p) => ({
        matchTitle: p.matchTitle,
        betLabel: p.betLabel,
        odds: p.odds,
      })),
      totalOdds: Math.round(totalOdds * 100) / 100,
      publishedAt: top[0].publishedAt,
      source: "stavka.tv",
      sourceUrl: top[0].sourceUrl,
      status: "pending",
    });
  });

  return expresses.sort((a, b) => b.totalOdds - a.totalOdds).slice(0, 20);
}

export async function getSports(): Promise<{ id: SportType; label: string; color: string; count: number }[]> {
  const predictions = await getAllPredictions();
  const sportCounts = new Map<SportType, number>();
  predictions.forEach((p) => {
    sportCounts.set(p.sport, (sportCounts.get(p.sport) || 0) + 1);
  });

  const labels: Record<SportType, string> = {
    football: "Футбол",
    hockey: "Хоккей",
    tennis: "Теннис",
    basketball: "Баскетбол",
    esports: "Киберспорт",
    other: "Другое",
  };
  const colors: Record<SportType, string> = {
    football: "#22a443",
    hockey: "#0161da",
    tennis: "#f2b100",
    basketball: "#ff6b00",
    esports: "#5e36ca",
    other: "#64748b",
  };

  return Array.from(sportCounts.entries())
    .map(([id, count]) => ({ id, label: labels[id], color: colors[id], count }))
    .sort((a, b) => b.count - a.count);
}

/* ============ Refresh trigger (called by cron) ============ */

export async function refreshAllSources(): Promise<{ stavka: number; total: number }> {
  // Clear cache to force fresh fetch
  cache.delete("stavka-predictions");
  const predictions = await fetchStavkaPredictions();
  return { stavka: predictions.length, total: predictions.length };
}
