const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DB_PATH = path.join(dataDir, 'smartseason.db');
const db = createClient({ url: `file:${DB_PATH}` });

async function initSchema() {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','agent')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      crop_type TEXT NOT NULL,
      planting_date DATE NOT NULL,
      stage TEXT NOT NULL DEFAULT 'Planted',
      location TEXT,
      size_hectares REAL,
      assigned_agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS field_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
      agent_id INTEGER NOT NULL REFERENCES users(id),
      previous_stage TEXT,
      new_stage TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TRIGGER IF NOT EXISTS fields_updated_at
      AFTER UPDATE ON fields
      BEGIN
        UPDATE fields SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END`,
  ];
  for (const sql of stmts) {
    await db.execute(sql);
  }
}

async function all(sql, args = []) {
  const res = await db.execute({ sql, args });
  return res.rows.map(row => Object.fromEntries(Object.entries(row)));
}

async function get(sql, args = []) {
  const rows = await all(sql, args);
  return rows[0] || null;
}

async function run(sql, args = []) {
  const res = await db.execute({ sql, args });
  return { lastInsertRowid: Number(res.lastInsertRowid), rowsAffected: res.rowsAffected };
}

module.exports = { initSchema, all, get, run };
