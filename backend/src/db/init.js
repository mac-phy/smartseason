const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','agent')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fields (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      crop_type TEXT NOT NULL,
      planting_date DATE NOT NULL,
      stage TEXT NOT NULL DEFAULT 'Planted' CHECK(stage IN ('Planted','Growing','Ready','Harvested')),
      location TEXT,
      size_hectares REAL,
      assigned_agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS field_updates (
      id SERIAL PRIMARY KEY,
      field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
      agent_id INTEGER NOT NULL REFERENCES users(id),
      previous_stage TEXT,
      new_stage TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS fields_updated_at ON fields;
    CREATE TRIGGER fields_updated_at
      BEFORE UPDATE ON fields
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  `);
}

async function all(sql, args = []) {
  let i = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++i}`);
  const res = await pool.query(pgSql, args);
  return res.rows;
}

async function get(sql, args = []) {
  const rows = await all(sql, args);
  return rows[0] || null;
}

async function run(sql, args = []) {
  let i = 0;
  let pgSql = sql.replace(/\?/g, () => `$${++i}`);
  if (pgSql.trimStart().toUpperCase().startsWith('INSERT')) {
    pgSql += ' RETURNING id';
  }
  const res = await pool.query(pgSql, args);
  return {
    lastInsertRowid: res.rows[0]?.id || null,
    rowsAffected: res.rowCount,
  };
}

module.exports = { initSchema, all, get, run };