-- Hamzaish brain schema (v0.1.0)
-- Derived store. Source of truth is the markdown files. Regenerate with `bun brain/ingest.ts`.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- documents: anything ingested gets one row
CREATE TABLE IF NOT EXISTS documents (
  id            TEXT    PRIMARY KEY,        -- relative path from Hamzaish root
  source        TEXT    NOT NULL,           -- 'brain/learnings', 'products/<slug>/decisions', 'meta/retros', etc.
  product       TEXT,                       -- product slug if scoped to one
  title         TEXT,                       -- first H1, or filename if none
  body          TEXT    NOT NULL,           -- full body
  mtime         INTEGER NOT NULL,           -- file mtime (epoch ms) for change detection
  content_hash  TEXT    NOT NULL,           -- sha256 of body for change detection
  ingested_at   INTEGER NOT NULL            -- when this row was last written
);

CREATE INDEX IF NOT EXISTS idx_documents_source  ON documents(source);
CREATE INDEX IF NOT EXISTS idx_documents_product ON documents(product);

-- FTS5 mirror — contentless, kept in sync by triggers below
CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
  title,
  body,
  source UNINDEXED,
  product UNINDEXED,
  content='documents',
  content_rowid='rowid',
  tokenize='porter unicode61'
);

CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
  INSERT INTO docs_fts(rowid, title, body, source, product)
  VALUES (new.rowid, new.title, new.body, new.source, new.product);
END;

CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
  INSERT INTO docs_fts(docs_fts, rowid, title, body, source, product)
  VALUES ('delete', old.rowid, old.title, old.body, old.source, old.product);
END;

CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
  INSERT INTO docs_fts(docs_fts, rowid, title, body, source, product)
  VALUES ('delete', old.rowid, old.title, old.body, old.source, old.product);
  INSERT INTO docs_fts(rowid, title, body, source, product)
  VALUES (new.rowid, new.title, new.body, new.source, new.product);
END;

-- entities: extracted in Phase C (gbrain-style). Empty stub for now.
CREATE TABLE IF NOT EXISTS entities (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  type      TEXT    NOT NULL,   -- 'product' | 'person' | 'tech' | 'decision' | 'concept'
  name      TEXT    NOT NULL,
  metadata  TEXT,               -- JSON
  UNIQUE(type, name)
);

-- edges: typed relations (Phase C). Empty stub for now.
CREATE TABLE IF NOT EXISTS edges (
  source_id        INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  target_id        INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  relation         TEXT    NOT NULL,   -- 'works_on' | 'decided_in' | 'depends_on' | 'discusses'
  evidence_doc_id  TEXT    REFERENCES documents(id) ON DELETE SET NULL,
  PRIMARY KEY (source_id, target_id, relation)
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
