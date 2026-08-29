-- brain schema — starter (copied verbatim from Hamzaish's own brain/schema.sql)
-- Derived store. Source of truth is the markdown files. Regenerate with `bun brain/ingest.ts`.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- documents: anything ingested gets one row
CREATE TABLE IF NOT EXISTS documents (
  id            TEXT    PRIMARY KEY,        -- relative path from BRAIN_ROOT
  source        TEXT    NOT NULL,           -- top-level folder name (see corpus.ts)
  product       TEXT,                       -- unused by the starter; left for parity with Hamzaish's schema
  title         TEXT,                       -- first H1, or filename if none
  body          TEXT    NOT NULL,           -- full body
  mtime         INTEGER NOT NULL,           -- file mtime (epoch ms) for change detection
  content_hash  TEXT    NOT NULL,           -- sha256 of body for change detection
  ingested_at   INTEGER NOT NULL            -- when this row was last written
);

CREATE INDEX IF NOT EXISTS idx_documents_source  ON documents(source);

-- FTS5 mirror — contentless, kept in sync by triggers below
CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
  title,
  body,
  source UNINDEXED,
  content='documents',
  content_rowid='rowid',
  tokenize='porter unicode61'
);

CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
  INSERT INTO docs_fts(rowid, title, body, source)
  VALUES (new.rowid, new.title, new.body, new.source);
END;

CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
  INSERT INTO docs_fts(docs_fts, rowid, title, body, source)
  VALUES ('delete', old.rowid, old.title, old.body, old.source);
END;

CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
  INSERT INTO docs_fts(docs_fts, rowid, title, body, source)
  VALUES ('delete', old.rowid, old.title, old.body, old.source);
  INSERT INTO docs_fts(rowid, title, body, source)
  VALUES (new.rowid, new.title, new.body, new.source);
END;

-- brain_meta: small key/value facts about the index itself (not about documents).
-- Holds `corpus_fingerprint` — see freshness.ts.
CREATE TABLE IF NOT EXISTS brain_meta (
  key        TEXT    PRIMARY KEY,
  value      TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);

-- ingest_runs: audit log
CREATE TABLE IF NOT EXISTS ingest_runs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at    INTEGER NOT NULL,
  finished_at   INTEGER NOT NULL,
  files_added   INTEGER NOT NULL DEFAULT 0,
  files_updated INTEGER NOT NULL DEFAULT 0,
  files_deleted INTEGER NOT NULL DEFAULT 0,
  files_skipped INTEGER NOT NULL DEFAULT 0,
  notes         TEXT
);
