// Public GitHub data for the live cards. Works without a token (for local
// runs); in Actions, GITHUB_TOKEN raises rate limits and unlocks GraphQL.
import fs from 'node:fs';

const API = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN;
const headers = {
  'User-Agent': 'akashmhatredev-profile-assets',
  Accept: 'application/vnd.github+json',
  ...(token && { Authorization: `Bearer ${token}` }),
};

async function rest(path) {
  const res = await fetch(API + path, { headers });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function calendarFromGraphQL(login, years) {
  const now = new Date().toISOString();
  const fields = years
    .map((y) => {
      const to = `${y}-12-31T23:59:59Z` > now ? now : `${y}-12-31T23:59:59Z`;
      return `y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${to}") {
        contributionCalendar { weeks { contributionDays { date contributionCount } } } }`;
    })
    .join('\n');
  const res = await fetch(`${API}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: `query { user(login: "${login}") { ${fields} } }` }),
  });
  const json = await res.json();
  if (!res.ok || json.errors || !json.data?.user) throw new Error(JSON.stringify(json.errors ?? json));
  const days = new Map();
  for (const y of years) {
    for (const week of json.data.user[`y${y}`].contributionCalendar.weeks) {
      for (const d of week.contributionDays) days.set(d.date, d.contributionCount);
    }
  }
  return days;
}

// Fallback: the same HTML fragment the profile page loads.
async function calendarFromHtml(login, years) {
  const days = new Map();
  for (const y of years) {
    const url = `https://github.com/users/${login}/contributions?from=${y}-01-01&to=${y}-12-31`;
    const html = await (await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const dateById = new Map();
    for (const [td] of html.matchAll(/<td\b[^>]*>/g)) {
      const date = /data-date="([\d-]+)"/.exec(td)?.[1];
      const id = /\bid="([^"]+)"/.exec(td)?.[1];
      if (date && id) dateById.set(id, date);
    }
    for (const [, id, label] of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)</g)) {
      const date = dateById.get(id);
      if (!date || !date.startsWith(String(y))) continue;
      const n = /^([\d,]+)/.exec(label.trim());
      days.set(date, n ? Number(n[1].replace(/,/g, '')) : 0);
    }
  }
  if (!days.size) throw new Error('could not read the contribution calendar');
  return days;
}

// STATS_CACHE=path.json reuses one fetch across local runs while tweaking the design.
export async function fetchStats(login) {
  const cache = process.env.STATS_CACHE;
  if (cache && fs.existsSync(cache)) {
    const saved = JSON.parse(fs.readFileSync(cache, 'utf8'));
    return { ...saved, days: new Map(saved.days) };
  }
  const stats = await fetchFresh(login);
  if (cache) fs.writeFileSync(cache, JSON.stringify({ ...stats, days: [...stats.days] }));
  return stats;
}

async function fetchFresh(login) {
  const user = await rest(`/users/${login}`);
  const repos = (await rest(`/users/${login}/repos?per_page=100&type=owner`)).filter((r) => !r.fork);
  const languages = await Promise.all(repos.map((r) => rest(`/repos/${login}/${r.name}/languages`)));
  const q = encodeURIComponent(`author:${login} type:pr is:merged`);
  const mergedPrs = (await rest(`/search/issues?q=${q}&per_page=1`)).total_count;

  const first = new Date(user.created_at).getUTCFullYear();
  const years = Array.from({ length: new Date().getUTCFullYear() - first + 1 }, (_, i) => first + i);
  let days;
  if (token) {
    try {
      days = await calendarFromGraphQL(login, years);
    } catch (err) {
      console.warn(`  ! GraphQL calendar failed, falling back to HTML: ${err.message}`);
    }
  }
  days ??= await calendarFromHtml(login, years);

  return { user, repos, languages, mergedPrs, days };
}
