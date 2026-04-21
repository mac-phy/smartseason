const express = require('express');
const cors = require('cors');
const { initSchema } = require('./db/init');

const authRoutes = require('./routes/auth');
const fieldsRoutes = require('./routes/fields');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS — in production set FRONTEND_URL to your Render frontend URL
// e.g. https://smartseason-frontend.onrender.com
// If FRONTEND_URL is not set we allow all origins (safe for an assessment)
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps, same-origin)
    if (!origin) return callback(null, true);
    // If no FRONTEND_URL is configured, allow everything
    if (!FRONTEND_URL) return callback(null, true);
    // Allow the configured frontend URL and any localhost port for local dev
    const allowed = [
      FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
    ];
    if (allowed.includes(origin)) return callback(null, true);
    // Also allow any *.onrender.com origin so previews work without reconfiguring
    if (origin.endsWith('.onrender.com')) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// Health check — useful to verify Render deployment is live
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  service: 'SmartSeason API',
  env: process.env.NODE_ENV || 'development',
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldsRoutes);
app.use('/api/users', usersRoutes);


//// TEMPORARY — remove after seeding
app.get('/api/setup', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { run, get } = require('./db/init');
    const hash = (p) => bcrypt.hashSync(p, 10);

    await run('DELETE FROM field_updates');
    await run('DELETE FROM fields');
    await run('DELETE FROM users');

    const admin = await run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
      ['Sarah Coordinator','admin@smartseason.com',hash('admin123'),'admin']);
    const a1 = await run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
      ['James Mwangi','james@smartseason.com',hash('agent123'),'agent']);
    const a2 = await run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
      ['Grace Wanjiku','grace@smartseason.com',hash('agent123'),'agent']);
    const a3 = await run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
      ['Peter Kamau','peter@smartseason.com',hash('agent123'),'agent']);

    const daysAgo = (n) => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0]; };

    const f1 = await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['Sunrise Plot A','Maize',daysAgo(80),'Ready','Kiambu North',3.5,a1.lastInsertRowid,admin.lastInsertRowid]);
    await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['Sunrise Plot B','Beans',daysAgo(45),'Growing','Kiambu North',2.0,a1.lastInsertRowid,admin.lastInsertRowid]);
    await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['Valley Green','Tomatoes',daysAgo(120),'Harvested','Kiambu South',1.5,a1.lastInsertRowid,admin.lastInsertRowid]);
    await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['Hilltop Field','Wheat',daysAgo(10),'Planted','Kiambu East',5.0,a1.lastInsertRowid,admin.lastInsertRowid]);
    await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['Riverside Farm 1','Rice',daysAgo(95),'Ready','Muranga Central',4.0,a2.lastInsertRowid,admin.lastInsertRowid]);
    await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['Riverside Farm 2','Sugarcane',daysAgo(200),'Growing','Muranga Central',6.5,a2.lastInsertRowid,admin.lastInsertRowid]);
    await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['Golden Acres','Maize',daysAgo(5),'Planted','Muranga West',3.0,a2.lastInsertRowid,admin.lastInsertRowid]);
    await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['Eastern Plains','Sorghum',daysAgo(60),'Growing','Thika East',8.0,a3.lastInsertRowid,admin.lastInsertRowid]);
    await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['Mango Grove','Mango',daysAgo(150),'Harvested','Thika West',2.5,a3.lastInsertRowid,admin.lastInsertRowid]);
    await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['New Clearance','Beans',daysAgo(3),'Planted','Thika North',1.8,a3.lastInsertRowid,admin.lastInsertRowid]);
    await run('INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)',
      ['Reserve Block','Maize',daysAgo(70),'Growing','Central Hub',4.2,null,admin.lastInsertRowid]);

    res.json({ message: '✅ Database seeded successfully', users: 4, fields: 11 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 404 — catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  await initSchema();
  app.listen(PORT, () => {
    console.log(`✅ SmartSeason API running on port ${PORT}`);
    console.log(`   FRONTEND_URL: ${FRONTEND_URL || '(not set — all origins allowed)'}`);
  });
}

start().catch(e => { console.error(e); process.exit(1); });
