-- 0009: Language Requests table
-- Community members can request new languages; admin approves → pipeline runs.

DO $$ BEGIN
  CREATE TYPE language_request_status AS ENUM ('pending', 'approved', 'in_progress', 'completed', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS language_requests (
  id SERIAL PRIMARY KEY,
  language_name VARCHAR(100) NOT NULL,
  language_code VARCHAR(10) NOT NULL UNIQUE,
  native_name VARCHAR(100) NOT NULL,
  flag VARCHAR(10) NOT NULL,
  requester_name VARCHAR(200),
  requester_telegram VARCHAR(100),
  reason TEXT,
  status language_request_status NOT NULL DEFAULT 'pending',
  votes INTEGER NOT NULL DEFAULT 1,
  pipeline_progress JSONB,
  admin_notes TEXT,
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
