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


// TEMPORARY — seed endpoint, remove after first deploy
app.get('/api/setup', async (req, res) => {
  try {
    const { seed } = require('./db/seed');
    await seed();
    res.json({ message: 'Database seeded successfully' });
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
