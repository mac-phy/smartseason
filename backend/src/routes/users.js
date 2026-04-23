const express = require('express');
const { all, get, run } = require('../db/init');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { computeStatus } = require('../utils/status');
const { ROLES, isAdmin } = require('../utils/roles');

const router = express.Router();

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await all("SELECT id,name,email,role,created_at FROM users ORDER BY role,name");
    return res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/agents', authenticate, requireAdmin, async (req, res) => {
  try {
    const agents = await all(`
      SELECT u.id, u.name, u.email, u.created_at,
             COUNT(f.id) AS field_count
      FROM users u LEFT JOIN fields f ON f.assigned_agent_id = u.id
      WHERE u.role = ?
      GROUP BY u.id ORDER BY u.name`, [ROLES.AGENT]);
    return res.json(agents);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/agents', authenticate, requireAdmin, async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, ROLES.AGENT]
    );
    const agent = await get(`
      SELECT u.id, u.name, u.email, u.created_at, 0 AS field_count
      FROM users u
      WHERE u.id = ?`, [result.lastInsertRowid]);
    return res.status(201).json(agent);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    if (isAdmin(req.user.role)) {
      const fields = await all(`
        SELECT f.*,
               (SELECT created_at FROM field_updates WHERE field_id=f.id ORDER BY created_at DESC LIMIT 1) AS last_update_date
        FROM fields f`);
      const enriched = fields.map(f => ({ ...f, status: computeStatus(f, f.last_update_date) }));
      const byStage = { Planted:0, Growing:0, Ready:0, Harvested:0 };
      const byStatus = { Active:0, 'At Risk':0, Completed:0 };
      enriched.forEach(f => {
        byStage[f.stage] = (byStage[f.stage]||0) + 1;
        byStatus[f.status] = (byStatus[f.status]||0) + 1;
      });
      const recentUpdates = await all(`
        SELECT fu.*, f.name AS field_name, u.name AS agent_name
        FROM field_updates fu JOIN fields f ON fu.field_id=f.id JOIN users u ON fu.agent_id=u.id
        ORDER BY fu.created_at DESC LIMIT 8`);
      const agentRow = await get('SELECT COUNT(*) AS count FROM users WHERE role = ?', [ROLES.AGENT]);
      return res.json({ totalFields: enriched.length, byStage, byStatus, recentUpdates, agentCount: agentRow.count });
    }

    // Agent dashboard
    const fields = await all(`
      SELECT f.*,
             (SELECT created_at FROM field_updates WHERE field_id=f.id ORDER BY created_at DESC LIMIT 1) AS last_update_date
      FROM fields f WHERE f.assigned_agent_id = ?`, [req.user.id]);
    const enriched = fields.map(f => ({ ...f, status: computeStatus(f, f.last_update_date) }));
    const byStage = { Planted:0, Growing:0, Ready:0, Harvested:0 };
    const byStatus = { Active:0, 'At Risk':0, Completed:0 };
    enriched.forEach(f => {
      byStage[f.stage] = (byStage[f.stage]||0) + 1;
      byStatus[f.status] = (byStatus[f.status]||0) + 1;
    });
    const recentUpdates = await all(`
      SELECT fu.*, f.name AS field_name
      FROM field_updates fu JOIN fields f ON fu.field_id=f.id
      WHERE fu.agent_id=? ORDER BY fu.created_at DESC LIMIT 5`, [req.user.id]);
    return res.json({ totalFields: enriched.length, byStage, byStatus, recentUpdates, atRiskFields: enriched.filter(f=>f.status==='At Risk') });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
