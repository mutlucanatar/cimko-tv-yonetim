const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "signage.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  location TEXT,
  status TEXT DEFAULT 'Aktif',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS groups_tbl (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenarios (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenario_items (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  start_date TEXT,
  end_date TEXT,
  duration_sec INTEGER
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
  group_id TEXT REFERENCES groups_tbl(id) ON DELETE SET NULL,
  scenario_id TEXT REFERENCES scenarios(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Aktif',
  os TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  src TEXT NOT NULL,
  duration_sec INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'Aktif',
  days_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rule_devices (
  rule_id TEXT NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  PRIMARY KEY (rule_id, device_id)
);

CREATE TABLE IF NOT EXISTS food_menus (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  tags_json TEXT,
  foods_json TEXT
);
`);

module.exports = db;
