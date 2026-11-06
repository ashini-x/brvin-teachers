PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS id_sequences (
  scope_key TEXT PRIMARY KEY,
  current_value INTEGER NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  updated_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO id_sequences (scope_key,current_value,updated_at) VALUES ('tenant',0,unixepoch()*1000);
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  tenant_ref TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 120),
  student_display_name TEXT NOT NULL CHECK (length(student_display_name) BETWEEN 2 AND 120),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_teachers_status_created ON teachers(status,created_at DESC);
CREATE TABLE IF NOT EXISTS tenant_brvin_projects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  brvin_project_id TEXT NOT NULL UNIQUE,
  project_ref TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  provisioning_status TEXT NOT NULL CHECK (provisioning_status IN ('provisioning','active','needs_attention','revoked')),
  operation_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tenant_brvin_projects_tenant ON tenant_brvin_projects(tenant_id,created_at DESC);
CREATE TABLE IF NOT EXISTS operator_audit_events (
  id TEXT PRIMARY KEY,
  actor_email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reference TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL,
  tenant_id TEXT REFERENCES teachers(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_operator_audit_tenant_created ON operator_audit_events(tenant_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operator_audit_created ON operator_audit_events(created_at DESC);
