// SYNTHETIC fixtures for xray-harvest tests — every word here is invented.
// Shapes mirror the real services (EDGAR EFTS, iTunes RSS JSON, Reddit .json,
// HN Algolia, plain HTML) so the parsers are contract-tested without the network
// and without redistributing a single byte of real harvested text (SPEC §Boundaries).

export const FIXTURE_NOW = '2026-08-16T00:00:00.000Z';

export const SITE_HTML = `<!doctype html>
<html><head>
  <title>FakeCo — Imaginary Widget Pricing</title>
  <style>.hero { color: red; }</style>
  <script>console.log("tracking that must never appear in text");</script>
</head><body>
  <h1>FakeCo Pricing</h1>
  <p>Starter plan: $9/mo &amp; includes 100 imaginary widgets.</p>
  <p>Enterprise: contact&nbsp;sales — SSO, audit&#39;s logs, SLA.</p>
  <!-- a comment that should vanish -->
</body></html>`;

export const EDGAR_SEARCH_JSON = {
  hits: {
    total: { value: 2 },
    hits: [
      {
        _id: '0009999999-26-000042:fakeco-20260101.htm',
        _source: {
          ciks: ['0009999999'], // live EDGAR field name (plural), verified 2026-08-16
          display_names: ['FakeCo Holdings Inc.  (FAKE)  (CIK 0009999999)'],
          file_date: '2026-01-30',
          root_forms: ['10-K'],
        },
      },
      {
        _id: '0008888888-26-000007:imagicorp-20260215.htm',
        _source: {
          ciks: ['0008888888'],
          display_names: ['ImagiCorp Ltd.  (IMGN)  (CIK 0008888888)'],
          file_date: '2026-02-20',
          root_forms: ['10-Q'],
        },
      },
    ],
  },
};

export const EDGAR_FILING_HTML = `<html><body>
<h2>Item 1A. Risk Factors</h2>
<p>Our imaginary widget market is intensely competitive. Customers may switch to
fictional alternatives if onboarding takes longer than one pretend afternoon.</p>
</body></html>`;

export const ITUNES_REVIEWS_JSON = {
  feed: {
    entry: [
      // first entry is the app itself in the real feed — parsers must skip it
      { 'im:name': { label: 'FakeWidget App' }, rights: { label: '© FakeCo' } },
      {
        author: { name: { label: 'RealSounding Name' }, uri: { label: 'https://example.test/u/x' } },
        title: { label: 'Wish setup were simpler' },
        content: { label: 'Took me a whole imaginary weekend to connect my pretend account.' },
        'im:rating': { label: '2' },
      },
      {
        author: { name: { label: 'Another Person' } },
        title: { label: 'Great once running' },
        content: { label: 'After setup it purrs. Support replied in a fictional hour.' },
        'im:rating': { label: '5' },
      },
    ],
  },
};

export const REDDIT_THREAD_JSON = [
  {
    data: {
      children: [
        {
          data: {
            title: 'Anyone else tired of imaginary widget tools?',
            selftext: 'I have tried three of them and u/some_real_user agrees they all break.',
            subreddit: 'fakewidgets',
          },
        },
      ],
    },
  },
  {
    data: {
      children: [
        {
          data: {
            body: 'Switched away because pricing pages hide the real cost. — u/angryperson99',
            replies: {
              data: {
                children: [
                  { data: { body: 'Same. The export feature is pretend-broken.', replies: '' } },
                ],
              },
            },
          },
        },
        { kind: 'more', data: {} },
      ],
    },
  },
];

export const HN_SEARCH_JSON = {
  hits: [
    {
      objectID: '99000001',
      title: 'Show HN: I built an imaginary widget analyzer',
      url: 'https://example.test/launch',
      story_text: 'Built this because every existing tool made me cry fictional tears.',
    },
    {
      objectID: '99000002',
      title: null,
      comment_text: 'The incumbent charges per pretend seat and everyone hates it.',
      story_title: 'Ask HN: widget tooling fatigue?',
    },
  ],
};

export const ROBOTS_TXT = `User-agent: *
Disallow: /private/
Allow: /private/press/

User-agent: hamzaish-xray
Disallow: /no-xray/
`;
