// T1 contract tests for the xray-harvest core — synthetic fixtures only,
// zero network (nothing here calls fetch; parsers are pure functions).

import { describe, expect, test } from 'bun:test';
import {
  applyCap, buildPlan, corpusFileContent, corpusFilename, htmlToText,
  manifestRow, parseArgs, parseEdgarFiling, parseEdgarSearch, parseHnSearch,
  parseItunesReviews, parseRedditThread, parseSitePage, robotsAllows,
  checkCitations, citationGateVerdict, scrubUserRefs, sha256, stampDoc, uaFor,
} from './xray-harvest';
import {
  EDGAR_FILING_HTML, EDGAR_SEARCH_JSON, FIXTURE_NOW, HN_SEARCH_JSON,
  ITUNES_REVIEWS_JSON, REDDIT_THREAD_JSON, ROBOTS_TXT, SITE_HTML,
} from './fixtures/xray-fixtures';

describe('primitives', () => {
  test('sha256 is stable and stampDoc mirrors it with the injected time', () => {
    const doc = stampDoc(
      { url: 'https://example.test/a', source: 'site', title: 't', text: 'hello market' },
      FIXTURE_NOW,
    );
    expect(doc.sha256).toBe(sha256('hello market'));
    expect(doc.fetchedAt).toBe(FIXTURE_NOW);
  });

  test('applyCap keeps N and reports the exact overflow — never silent', () => {
    const r = applyCap([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
    expect(r.kept).toEqual([1, 2, 3]);
    expect(r.truncated).toBe(7);
    expect(applyCap([1, 2], 5).truncated).toBe(0);
  });

  test('scrubUserRefs keeps the complaint, never the complainer', () => {
    const out = scrubUserRefs('u/angry_person and @somehandle both said it breaks');
    expect(out).not.toContain('angry_person');
    expect(out).not.toContain('somehandle');
    expect(out).toContain('said it breaks');
  });
});

describe('robots.txt', () => {
  test('star group: longest match wins, Allow can carve out a subtree', () => {
    expect(robotsAllows(ROBOTS_TXT, '/public/page', 'randombot')).toBe(true);
    expect(robotsAllows(ROBOTS_TXT, '/private/data', 'randombot')).toBe(false);
    expect(robotsAllows(ROBOTS_TXT, '/private/press/release', 'randombot')).toBe(true);
  });

  test('our UA gets its own group; empty robots allows everything', () => {
    expect(robotsAllows(ROBOTS_TXT, '/no-xray/thing')).toBe(false);
    expect(robotsAllows(ROBOTS_TXT, '/private/data')).toBe(true); // specific group replaces *
    expect(robotsAllows('', '/anything')).toBe(true);
  });
});

describe('site pages', () => {
  test('strips script/style/comments, decodes entities, keeps the words', () => {
    const { title, text } = htmlToText(SITE_HTML);
    expect(title).toBe('FakeCo — Imaginary Widget Pricing');
    expect(text).toContain('$9/mo & includes 100 imaginary widgets');
    expect(text).toContain("audit's logs");
    expect(text).not.toContain('tracking that must never appear');
    expect(text).not.toContain('color: red');
    expect(text).not.toContain('a comment that should vanish');
  });

  test('parseSitePage stamps a full document', () => {
    const doc = parseSitePage(SITE_HTML, 'https://example.test/pricing', FIXTURE_NOW);
    expect(doc.source).toBe('site');
    expect(doc.title).toContain('FakeCo');
    expect(doc.sha256).toHaveLength(64);
  });
});

describe('EDGAR', () => {
  test('search response becomes fetchable filing references', () => {
    const refs = parseEdgarSearch(EDGAAR_GUARD());
    expect(refs).toHaveLength(2);
    expect(refs[0].url).toBe(
      'https://www.sec.gov/Archives/edgar/data/9999999/000999999926000042/fakeco-20260101.htm',
    );
    expect(refs[0].title).toContain('FakeCo Holdings');
    expect(refs[0].title).toContain('10-K');
  });

  test('a fetched filing becomes one stamped document', () => {
    const [ref] = parseEdgarSearch(EDGAAR_GUARD());
    const doc = parseEdgarFiling(EDGAR_FILING_HTML, ref, FIXTURE_NOW);
    expect(doc.source).toBe('edgar');
    expect(doc.text).toContain('intensely competitive');
  });

  // tiny indirection so a typo'd fixture import fails loudly here, not in three tests
  function EDGAAR_GUARD(): unknown {
    return EDGAR_SEARCH_JSON;
  }
});

describe('iTunes reviews', () => {
  test('skips the app-metadata entry, keeps review text, drops authors entirely', () => {
    const docs = parseItunesReviews(ITUNES_REVIEWS_JSON, '123456', FIXTURE_NOW);
    expect(docs).toHaveLength(2);
    expect(docs[0].title).toBe('Wish setup were simpler (★2)');
    expect(docs[0].text).toContain('imaginary weekend');
    const all = JSON.stringify(docs);
    expect(all).not.toContain('RealSounding');
    expect(all).not.toContain('Another Person');
  });
});

describe('Reddit thread', () => {
  test('flattens post + nested comments into one scrubbed document', () => {
    const doc = parseRedditThread(REDDIT_THREAD_JSON, 'https://reddit.example/r/t/1', FIXTURE_NOW);
    expect(doc.title).toContain('tired of imaginary widget tools');
    expect(doc.text).toContain('pricing pages hide the real cost');
    expect(doc.text).toContain('pretend-broken'); // nested reply captured
    expect(doc.text).not.toContain('angryperson99');
    expect(doc.text).not.toContain('some_real_user');
  });
});

describe('CLI plumbing (T2 — still zero network in tests)', () => {
  test('parseArgs reads slug, dry-run, source filter and caps', () => {
    const a = parseArgs(['--slug', 'copyright', '--dry-run', '--sources', 'sites,hn', '--cap-sites', '2']);
    expect(a.slug).toBe('copyright');
    expect(a.dryRun).toBe(true);
    expect([...a.sources].sort()).toEqual(['hn', 'site']);
    expect(a.caps.sites).toBe(2);
    expect(a.caps.reviews).toBe(100); // untouched caps keep spec defaults
  });

  test('buildPlan caps loudly and honors the source filter', () => {
    const args = parseArgs(['--slug', 'x', '--sources', 'sites', '--cap-sites', '2']);
    const { items, notes } = buildPlan(
      { sites: ['https://a.test', 'https://b.test', 'https://c.test'], hnQueries: ['ignored'] },
      args,
    );
    expect(items).toHaveLength(2);
    expect(items.every((i) => i.kind === 'site')).toBe(true);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toContain('1 dropped');
  });

  test('UA declares a contact when provided, stays repo-identified otherwise', () => {
    expect(uaFor('someone@example.test')).toContain('someone@example.test');
    expect(uaFor(undefined)).toContain('github.com/hamza-ali-shahjahan/hamzaish');
    expect(uaFor(undefined)).not.toContain('@');
  });

  test('corpus filenames are stable and safe; file content carries provenance', () => {
    const doc = stampDoc(
      { url: 'https://example.test/x', source: 'site', title: 'Löud & Wild: Pricing!!', text: 'body' },
      FIXTURE_NOW,
    );
    expect(corpusFilename(doc, 7)).toBe('site-007-l-ud-wild-pricing.md');
    const content = corpusFileContent(doc);
    expect(content).toContain(`sha256: ${doc.sha256}`);
    expect(content).toContain('url: https://example.test/x');
    expect(manifestRow(doc, 'corpus/site-007.md')).toContain(doc.sha256.slice(0, 12));
  });
});

describe('citation gate (T4 — the trust rule as math)', () => {
  const corpus = ['site-000-fakeco.md', 'hn-001-thread.md'];

  test('cited claims pass, speculation is counted separately, gate passes at ≥90%', () => {
    const synthesis = [
      '## Consensus',
      '- Everyone bundles onboarding help [src: site-000-fakeco.md]',
      '- Pricing pages hide totals [src: corpus/hn-001-thread.md]',
      '## ⚠ SPECULATION',
      '- The market probably consolidates next year',
    ].join('\n');
    const r = checkCitations(synthesis, corpus);
    expect(r.claims).toBe(2);
    expect(r.cited).toBe(2);
    expect(r.speculation).toBe(1);
    expect(citationGateVerdict(r).pass).toBe(true);
  });

  test('uncited claims and broken refs fail the gate loudly', () => {
    const synthesis = [
      '## Blind spots',
      '- Nobody serves the tiny-team segment', // uncited
      '- Support quality is the silent differentiator [src: does-not-exist.md]',
      '- One honest citation [src: hn-001-thread.md]',
    ].join('\n');
    const r = checkCitations(synthesis, corpus);
    expect(r.uncited).toHaveLength(1);
    expect(r.badRefs).toEqual(['does-not-exist.md']);
    expect(r.cited).toBe(1);
    const v = citationGateVerdict(r);
    expect(v.pass).toBe(false);
    expect(v.line).toContain('FAIL');
  });

  test('an empty synthesis can never pass (zero claims is not evidence)', () => {
    expect(citationGateVerdict(checkCitations('', corpus)).pass).toBe(false);
  });
});

describe('HN search', () => {
  test('keeps hits that carry text, titles fall back sensibly', () => {
    const docs = parseHnSearch(HN_SEARCH_JSON, FIXTURE_NOW);
    expect(docs).toHaveLength(2);
    expect(docs[0].url).toBe('https://news.ycombinator.com/item?id=99000001');
    expect(docs[1].title).toBe('Ask HN: widget tooling fatigue?');
    expect(docs[1].text).toContain('per pretend seat');
  });
});
