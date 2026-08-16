#!/usr/bin/env bun
// xray-harvest.ts — the market-xray evidence collector (SPEC: factory/skills/market-xray/SPEC.md).
//
// T1 (this file's pure core): parsers for the five keyless sources, provenance
// stamping, loud caps, robots.txt respect, and author-scrubbing — all
// fixture-testable with zero network. The CLI orchestration lands in T2.
//
// Boundaries (SPEC §Boundaries, enforced in code where code can enforce them):
//   read-only · no auth/paywalls · authors stripped at parse time · caps loud ·
//   every document carries url + fetch date + sha256 so citations stay checkable.

export type SourceKind = 'site' | 'edgar' | 'reviews' | 'reddit' | 'hn';

export interface SourceDoc {
  url: string;
  fetchedAt: string; // ISO timestamp — injected by the caller for determinism
  source: SourceKind;
  sha256: string; // hash of `text`, mirrored into the sources.md manifest
  title: string;
  text: string; // plain text/markdown; author names never enter this field
}

export interface CapResult<T> {
  kept: T[];
  truncated: number; // >0 must be reported LOUDLY by the caller (runs.md + stdout)
}

// ---------------------------------------------------------------- primitives

export function sha256(text: string): string {
  const h = new Bun.CryptoHasher('sha256');
  h.update(text);
  return h.digest('hex');
}

export function stampDoc(
  d: Omit<SourceDoc, 'sha256' | 'fetchedAt'>,
  now: string,
): SourceDoc {
  return { ...d, fetchedAt: now, sha256: sha256(d.text) };
}

/** Enforce a cap and SAY SO — silent truncation reads as full coverage. */
export function applyCap<T>(items: T[], cap: number): CapResult<T> {
  if (cap <= 0 || items.length <= cap) return { kept: items, truncated: 0 };
  return { kept: items.slice(0, cap), truncated: items.length - cap };
}

/** Replace u/username mentions and long @handles — keep the complaint, never the complainer. */
export function scrubUserRefs(text: string): string {
  return text
    .replace(/\bu\/[A-Za-z0-9_-]{2,}/g, 'u/[user]')
    .replace(/\B@[A-Za-z0-9_]{3,}/g, '@[user]');
}

/** Minimal HTML → readable text: drops script/style/comments, unwraps tags, decodes common entities. */
export function htmlToText(html: string): { title: string; text: string } {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|h[1-6]|li|tr|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
  return { title: decodeEntitiesInTitle(title), text };
}

function decodeEntitiesInTitle(t: string): string {
  return t.replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"');
}

// ---------------------------------------------------------------- robots.txt

/**
 * RFC 9309, simplified honestly: pick the most specific matching group
 * (exact UA over *), then longest-path rule wins; Allow beats Disallow on ties.
 */
export function robotsAllows(robotsTxt: string, path: string, ua = 'hamzaish-xray'): boolean {
  type Rule = { allow: boolean; path: string };
  const groups = new Map<string, Rule[]>();
  let currentAgents: string[] = [];
  let lastWasAgent = false;
  for (const rawLine of robotsTxt.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === 'user-agent') {
      if (!lastWasAgent) currentAgents = [];
      currentAgents.push(value.toLowerCase());
      for (const a of currentAgents) if (!groups.has(a)) groups.set(a, []);
      lastWasAgent = true;
    } else if (field === 'allow' || field === 'disallow') {
      lastWasAgent = false;
      if (value === '' && field === 'disallow') continue; // empty disallow = allow all
      for (const a of currentAgents) groups.get(a)!.push({ allow: field === 'allow', path: value });
    } else {
      lastWasAgent = false;
    }
  }
  const rules = groups.get(ua.toLowerCase()) ?? groups.get('*') ?? [];
  let best: { allow: boolean; len: number } | null = null;
  for (const r of rules) {
    if (path.startsWith(r.path) && (best === null || r.path.length > best.len ||
        (r.path.length === best.len && r.allow && !best.allow))) {
      best = { allow: r.allow, len: r.path.length };
    }
  }
  return best ? best.allow : true;
}

// ---------------------------------------------------------------- parsers

/** One competitor page → one document. */
export function parseSitePage(html: string, url: string, now: string): SourceDoc {
  const { title, text } = htmlToText(html);
  return stampDoc({ url, source: 'site', title: title || url, text }, now);
}

export interface EdgarRef {
  url: string;
  title: string;
  fileDate: string;
}

/** EDGAR full-text search response → filing references (fetched individually later). */
export function parseEdgarSearch(json: unknown): EdgarRef[] {
  const hits = (json as { hits?: { hits?: unknown[] } })?.hits?.hits ?? [];
  const refs: EdgarRef[] = [];
  for (const h of hits as { _id?: string; _source?: { ciks?: string[]; cik?: string[]; display_names?: string[]; file_date?: string; root_forms?: string[] } }[]) {
    const id = h._id ?? '';
    const [accession, filename] = id.split(':');
    // Live EDGAR uses `ciks` (verified 2026-08-16); accept `cik` too for safety.
    const cik = (h._source?.ciks ?? h._source?.cik)?.[0]?.replace(/^0+/, '');
    if (!accession || !filename || !cik) continue;
    const accNoDashes = accession.replace(/-/g, '');
    refs.push({
      url: `https://www.sec.gov/Archives/edgar/data/${cik}/${accNoDashes}/${filename}`,
      title: `${h._source?.display_names?.[0] ?? 'Unknown filer'} — ${h._source?.root_forms?.[0] ?? 'filing'}`,
      fileDate: h._source?.file_date ?? '',
    });
  }
  return refs;
}

/** A fetched EDGAR filing page → one document. */
export function parseEdgarFiling(html: string, ref: EdgarRef, now: string): SourceDoc {
  const { text } = htmlToText(html);
  return stampDoc({ url: ref.url, source: 'edgar', title: ref.title, text }, now);
}

/** iTunes RSS review feed (JSON) → one document per review; authors never included. */
export function parseItunesReviews(json: unknown, appId: string, now: string): SourceDoc[] {
  const entries = (json as { feed?: { entry?: unknown[] } })?.feed?.entry ?? [];
  const docs: SourceDoc[] = [];
  for (const e of entries as { content?: { label?: string }; title?: { label?: string }; 'im:rating'?: { label?: string } }[]) {
    const body = e.content?.label;
    if (!body) continue; // the app-metadata entry has no content — skipped
    const rating = e['im:rating']?.label;
    docs.push(
      stampDoc(
        {
          url: `https://itunes.apple.com/rss/customerreviews/id=${appId}`,
          source: 'reviews',
          title: `${e.title?.label ?? 'Review'}${rating ? ` (★${rating})` : ''}`,
          text: scrubUserRefs(body),
        },
        now,
      ),
    );
  }
  return docs;
}

/** Reddit thread .json → one document (post + flattened comments, users scrubbed). */
export function parseRedditThread(json: unknown, url: string, now: string): SourceDoc {
  const arr = json as { data?: { children?: unknown[] } }[];
  const post = (arr?.[0]?.data?.children?.[0] as { data?: { title?: string; selftext?: string } })?.data;
  const lines: string[] = [];
  if (post?.selftext) lines.push(scrubUserRefs(post.selftext));
  const walk = (children: unknown[], depth: number): void => {
    if (depth > 12 || lines.length > 300) return;
    for (const c of children as { kind?: string; data?: { body?: string; replies?: { data?: { children?: unknown[] } } | '' } }[]) {
      if (c.kind === 'more') continue;
      const body = c.data?.body;
      if (body) lines.push(`- ${scrubUserRefs(body)}`);
      const replies = c.data?.replies;
      if (replies && typeof replies === 'object') walk(replies.data?.children ?? [], depth + 1);
    }
  };
  walk(arr?.[1]?.data?.children ?? [], 0);
  return stampDoc(
    { url, source: 'reddit', title: post?.title ?? url, text: lines.join('\n') },
    now,
  );
}

/** HN Algolia search response → one document per hit that carries any text. */
export function parseHnSearch(json: unknown, now: string): SourceDoc[] {
  const hits = (json as { hits?: unknown[] })?.hits ?? [];
  const docs: SourceDoc[] = [];
  for (const h of hits as { objectID?: string; title?: string | null; story_title?: string; story_text?: string; comment_text?: string }[]) {
    const text = h.story_text ?? h.comment_text;
    if (!text || !h.objectID) continue;
    docs.push(
      stampDoc(
        {
          url: `https://news.ycombinator.com/item?id=${h.objectID}`,
          source: 'hn',
          title: h.title ?? h.story_title ?? `HN item ${h.objectID}`,
          text: scrubUserRefs(text),
        },
        now,
      ),
    );
  }
  return docs;
}

// ---------------------------------------------------------------- CLI (T2)

import { existsSync, mkdirSync, appendFileSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * SEC EDGAR's fair-access policy requires a declared contact in the UA
 * (verified live 2026-08-16: contact → 200, URL-only → 403). The contact is
 * env-provided so no personal address ever lands in this public file.
 */
export function uaFor(contact?: string): string {
  return contact
    ? `hamzaish-xray/1.0 (${contact}; read-only market research)`
    : 'hamzaish-xray/1.0 (+https://github.com/hamza-ali-shahjahan/hamzaish; read-only market research)';
}
export const XRAY_UA = uaFor(process.env.XRAY_CONTACT);

export interface Targets {
  sites?: string[];
  edgarQueries?: string[];
  appIds?: string[];
  redditThreads?: string[];
  hnQueries?: string[];
}

export interface Caps {
  sites: number;
  filings: number;
  reviews: number;
  threads: number;
  hn: number;
}

export const DEFAULT_CAPS: Caps = { sites: 30, filings: 10, reviews: 100, threads: 10, hn: 10 };

export interface CliArgs {
  slug: string;
  dryRun: boolean;
  sources: Set<'site' | 'edgar' | 'reviews' | 'reddit' | 'hn'>;
  caps: Caps;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    slug: '',
    dryRun: false,
    sources: new Set(['site', 'edgar', 'reviews', 'reddit', 'hn']),
    caps: { ...DEFAULT_CAPS },
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--slug') args.slug = argv[++i] ?? '';
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--sources') {
      const list = (argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
      // "sites" reads naturally on the CLI; the internal kind is "site".
      args.sources = new Set(
        list.map((s) => (s === 'sites' ? 'site' : s)) as CliArgs['sources'] extends Set<infer K> ? K[] : never,
      );
    } else if (a === '--cap-sites') args.caps.sites = Number(argv[++i]) || 0;
    else if (a === '--cap-filings') args.caps.filings = Number(argv[++i]) || 0;
    else if (a === '--cap-reviews') args.caps.reviews = Number(argv[++i]) || 0;
    else if (a === '--cap-threads') args.caps.threads = Number(argv[++i]) || 0;
    else if (a === '--cap-hn') args.caps.hn = Number(argv[++i]) || 0;
  }
  return args;
}

export interface PlanItem {
  kind: 'site' | 'edgar-query' | 'app-reviews' | 'reddit-thread' | 'hn-query';
  target: string;
}

/** Deterministic plan from targets + caps; truncations become loud notes. */
export function buildPlan(targets: Targets, args: CliArgs): { items: PlanItem[]; notes: string[] } {
  const items: PlanItem[] = [];
  const notes: string[] = [];
  const take = (list: string[] | undefined, cap: number, kind: PlanItem['kind'], label: string): void => {
    const r = applyCap(list ?? [], cap);
    for (const t of r.kept) items.push({ kind, target: t });
    if (r.truncated > 0) notes.push(`⚠ ${label}: capped at ${cap} — ${r.truncated} dropped (raise --cap-* deliberately, never silently)`);
  };
  if (args.sources.has('site')) take(targets.sites, args.caps.sites, 'site', 'sites');
  if (args.sources.has('edgar')) take(targets.edgarQueries, args.caps.filings, 'edgar-query', 'EDGAR queries');
  if (args.sources.has('reviews')) take(targets.appIds, 5, 'app-reviews', 'app ids');
  if (args.sources.has('reddit')) take(targets.redditThreads, args.caps.threads, 'reddit-thread', 'reddit threads');
  if (args.sources.has('hn')) take(targets.hnQueries, args.caps.hn, 'hn-query', 'HN queries');
  return { items, notes };
}

const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled';

export function corpusFilename(doc: SourceDoc, index: number): string {
  return `${doc.source}-${String(index).padStart(3, '0')}-${slugify(doc.title).slice(0, 40)}.md`;
}

export function corpusFileContent(doc: SourceDoc): string {
  return `---\nsource: ${doc.source}\nurl: ${doc.url}\nfetchedAt: ${doc.fetchedAt}\nsha256: ${doc.sha256}\n---\n\n# ${doc.title}\n\n${doc.text}\n`;
}

export function manifestRow(doc: SourceDoc, file: string): string {
  return `| ${doc.fetchedAt.slice(0, 10)} | ${doc.source} | ${doc.url} | \`${doc.sha256.slice(0, 12)}…\` | ${file} |`;
}

// ---------------------------------------------------------------- citation gate

export interface CitationReport {
  claims: number;
  cited: number;
  rate: number;
  speculation: number;
  badRefs: string[];
  uncited: string[];
}

/**
 * The market-xray trust rule, as math (SPEC: ≥90% of claims cite a corpus file;
 * the rest live under a visible "⚠ SPECULATION" heading; a citation to a file
 * that doesn't exist is worse than none). Claims are "- " bullets outside the
 * speculation section; a citation is `[src: <corpus-filename>]`.
 */
export function checkCitations(synthesis: string, corpusFiles: string[]): CitationReport {
  const known = new Set(corpusFiles.map((f) => f.replace(/^.*corpus\//, '').replace(/^corpus\//, '')));
  let inSpeculation = false;
  let claims = 0;
  let cited = 0;
  let speculation = 0;
  const badRefs: string[] = [];
  const uncited: string[] = [];
  for (const line of synthesis.split('\n')) {
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      inSpeculation = /SPECULATION/i.test(heading[1]);
      continue;
    }
    if (!line.trim().startsWith('- ')) continue;
    if (inSpeculation) {
      speculation++;
      continue;
    }
    claims++;
    const refs = [...line.matchAll(/\[src:\s*([^\]]+)\]/g)].map((m) =>
      m[1].trim().replace(/^corpus\//, ''),
    );
    if (refs.length === 0) {
      uncited.push(line.trim().slice(0, 90));
      continue;
    }
    const bad = refs.filter((r) => !known.has(r));
    if (bad.length > 0) badRefs.push(...bad);
    else cited++;
  }
  return {
    claims,
    cited,
    rate: claims === 0 ? 0 : cited / claims,
    speculation,
    badRefs,
    uncited,
  };
}

export const CITATION_PASS_RATE = 0.9;

export function citationGateVerdict(r: CitationReport): { pass: boolean; line: string } {
  const pass = r.claims > 0 && r.rate >= CITATION_PASS_RATE && r.badRefs.length === 0;
  const pct = Math.round(r.rate * 100);
  return {
    pass,
    line: `CITATION GATE: ${pass ? 'PASS' : 'FAIL'} — ${r.cited}/${r.claims} claims cited (${pct}%), ${r.speculation} under ⚠ SPECULATION, ${r.badRefs.length} broken ref(s)`,
  };
}

// ---- network phase (only ever runs outside --dry-run) ----------------------

const lastHitByOrigin = new Map<string, number>();
async function politeFetch(url: string): Promise<string> {
  const origin = new URL(url).origin;
  const since = Date.now() - (lastHitByOrigin.get(origin) ?? 0);
  if (since < 1100) await new Promise((r) => setTimeout(r, 1100 - since));
  lastHitByOrigin.set(origin, Date.now());
  const res = await fetch(url, { headers: { 'User-Agent': XRAY_UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

const robotsCache = new Map<string, string>();
async function allowedByRobots(url: string): Promise<boolean> {
  const u = new URL(url);
  if (!robotsCache.has(u.origin)) {
    try {
      robotsCache.set(u.origin, await politeFetch(`${u.origin}/robots.txt`));
    } catch {
      robotsCache.set(u.origin, ''); // unreachable robots → default allow
    }
  }
  return robotsAllows(robotsCache.get(u.origin)!, u.pathname);
}

async function harvestItem(item: PlanItem, now: string, errors: string[]): Promise<SourceDoc[]> {
  try {
    switch (item.kind) {
      case 'site': {
        if (!(await allowedByRobots(item.target))) {
          errors.push(`robots.txt disallows ${item.target} — skipped (we knock, we don't barge in)`);
          return [];
        }
        return [parseSitePage(await politeFetch(item.target), item.target, now)];
      }
      case 'edgar-query': {
        const q = encodeURIComponent(item.target);
        const search = JSON.parse(await politeFetch(`https://efts.sec.gov/LATEST/search-index?q=${q}&forms=10-K,10-Q`));
        const refs = parseEdgarSearch(search).slice(0, 3); // per-query slice; global cap at plan level
        const docs: SourceDoc[] = [];
        for (const ref of refs) docs.push(parseEdgarFiling(await politeFetch(ref.url), ref, now));
        return docs;
      }
      case 'app-reviews': {
        const url = `https://itunes.apple.com/us/rss/customerreviews/id=${item.target}/sortby=mostrecent/json`;
        return parseItunesReviews(JSON.parse(await politeFetch(url)), item.target, now);
      }
      case 'reddit-thread': {
        const url = item.target.replace(/\/?$/, '.json');
        return [parseRedditThread(JSON.parse(await politeFetch(url)), item.target, now)];
      }
      case 'hn-query': {
        const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(item.target)}&tags=(story,comment)`;
        return parseHnSearch(JSON.parse(await politeFetch(url)), now);
      }
    }
  } catch (e) {
    errors.push(`${item.kind} ${item.target}: ${e instanceof Error ? e.message : String(e)}`);
    return [];
  }
}

if (import.meta.main) {
  // Citation-gate mode: the eval harness (and the skill's stage 4) call this.
  //   bun run xray-harvest --check-citations <synthesis.md> --corpus <corpusDir>
  const rawArgv = process.argv.slice(2);
  const ccIdx = rawArgv.indexOf('--check-citations');
  if (ccIdx !== -1) {
    const synthesisPath = rawArgv[ccIdx + 1];
    const corpusIdx = rawArgv.indexOf('--corpus');
    const corpusDir = corpusIdx !== -1 ? rawArgv[corpusIdx + 1] : '';
    if (!synthesisPath || !corpusDir || !existsSync(synthesisPath) || !existsSync(corpusDir)) {
      console.error('usage: bun run xray-harvest --check-citations <synthesis.md> --corpus <corpus-dir>');
      process.exit(1);
    }
    const { readdirSync } = await import('node:fs');
    const corpusFiles = readdirSync(corpusDir).filter((f) => f.endsWith('.md'));
    const report = checkCitations(readFileSync(synthesisPath, 'utf8'), corpusFiles);
    const verdict = citationGateVerdict(report);
    console.log(verdict.line);
    for (const u of report.uncited) console.log(`  uncited: ${u}`);
    for (const b of report.badRefs) console.log(`  broken ref: ${b}`);
    process.exit(verdict.pass ? 0 : 1);
  }

  const args = parseArgs(rawArgv);
  if (!args.slug) {
    console.error('usage: bun run xray-harvest --slug <product> [--dry-run] [--sources sites,edgar,reviews,reddit,hn] [--cap-sites N …]');
    process.exit(1);
  }
  const researchDir = join(ROOT, 'products', args.slug, 'research');
  const targetsPath = join(researchDir, 'targets.json');
  if (!existsSync(targetsPath)) {
    console.error(`✗ no targets file at products/${args.slug}/research/targets.json`);
    console.error('  The market-xray skill (stage 2, after your prune) writes it — or create it by hand:');
    console.error('  {"sites":["https://…"],"edgarQueries":["…"],"appIds":["…"],"redditThreads":["https://…"],"hnQueries":["…"]}');
    process.exit(1);
  }
  const targets: Targets = JSON.parse(readFileSync(targetsPath, 'utf8'));
  const { items, notes } = buildPlan(targets, args);
  if (args.sources.has('edgar') && (targets.edgarQueries?.length ?? 0) > 0 && !process.env.XRAY_CONTACT) {
    notes.push('⚠ EDGAR needs a declared contact (SEC fair-access): export XRAY_CONTACT="you@example.com" or those fetches will 403');
  }

  console.log(`xray-harvest · slug=${args.slug} · ${items.length} planned fetch group(s)`);
  for (const n of notes) console.log(`  ${n}`);
  if (args.dryRun) {
    for (const it of items) console.log(`  [plan] ${it.kind} → ${it.target}`);
    console.log('dry-run: nothing fetched, nothing written.');
    process.exit(0);
  }

  const started = Date.now();
  const now = new Date().toISOString();
  const errors: string[] = [];
  const all: SourceDoc[] = [];
  for (const item of items) {
    const docs = await harvestItem(item, now, errors);
    all.push(...docs);
    console.log(`  [got] ${item.kind} ${item.target} → ${docs.length} doc(s)`);
  }
  // Review cap applies across all apps combined — loudly.
  const reviews = all.filter((d) => d.source === 'reviews');
  const reviewCap = applyCap(reviews, args.caps.reviews);
  if (reviewCap.truncated > 0) notes.push(`⚠ reviews: capped at ${args.caps.reviews} — ${reviewCap.truncated} dropped`);
  const finals = [...all.filter((d) => d.source !== 'reviews'), ...reviewCap.kept];

  const corpusDir = join(researchDir, 'corpus');
  mkdirSync(corpusDir, { recursive: true });
  const manifestPath = join(researchDir, 'sources.md');
  if (!existsSync(manifestPath)) {
    writeFileSync(manifestPath, '# Sources — provenance manifest (committed; the raw corpus/ never is)\n\n| fetched | source | url | sha256 | file |\n|---|---|---|---|---|\n');
  }
  const counts: Record<string, number> = {};
  finals.forEach((doc, i) => {
    const file = corpusFilename(doc, i);
    writeFileSync(join(corpusDir, file), corpusFileContent(doc));
    appendFileSync(manifestPath, manifestRow(doc, `corpus/${file}`) + '\n');
    counts[doc.source] = (counts[doc.source] ?? 0) + 1;
  });
  const runsPath = join(researchDir, 'runs.md');
  if (!existsSync(runsPath)) {
    writeFileSync(runsPath, '# market-xray runs\n\n| date | docs by source | truncations | errors | seconds |\n|---|---|---|---|---|\n');
  }
  const secs = Math.round((Date.now() - started) / 1000);
  appendFileSync(
    runsPath,
    `| ${now.slice(0, 10)} | ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' ') || 'none'} | ${notes.length ? notes.join('; ') : '—'} | ${errors.length ? errors.length : '—'} | ${secs} |\n`,
  );

  console.log(`\n✓ ${finals.length} document(s) → products/${args.slug}/research/corpus/ (local-only)`);
  for (const n of notes) console.log(`  ${n}`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log('  provenance: sources.md · run log: runs.md · index it: bun run ingest');
  process.exit(finals.length === 0 && errors.length > 0 ? 1 : 0);
}
