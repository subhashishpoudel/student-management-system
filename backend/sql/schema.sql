-- ============================================================
-- Cell 1: Students table
-- Used by studentcontroller.ts. An existing table is left as is.
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id         SERIAL PRIMARY KEY,
  full_name  TEXT    NOT NULL,
  marks      INTEGER NOT NULL CHECK (marks BETWEEN 0 AND 100)
);


-- ============================================================
-- Cell 2: Contacts table
-- Used by contactController.ts. An existing table is left as is.
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
