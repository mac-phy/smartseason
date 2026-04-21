const express = require('express');
const { all, get, run } = require('../db/init');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { computeStatus } = require('../utils/status');

const router = express.Router();

async function enrichField(field) {
  const lastUpdate = await get(
    'SELECT created_at FROM field_updates WHERE field_id = ? ORDER BY created_at DESC LIMIT 1',
    [field.id]
  );
  const status = computeStatus(field, lastUpdate?.created_at);
  return { ...field, status, last_update: lastUpdate?.created_at || null };
}

// GET /api/fields
router.get('/', authenticate, async (req, res) => {
  try {
    let fields;
    if (req.user.role === 'admin') {
      fields = await all(`
        SELECT f.*, u.name AS agent_name, u.email AS agent_email
        FROM fields f LEFT JOIN users u ON f.assigned_agent_id = u.id
        ORDER BY f.updated_at DESC`);
    } else {
      fields = await all(`
        SELECT f.*, u.name AS agent_name, u.email AS agent_email
        FROM fields f LEFT JOIN users u ON f.assigned_agent_id = u.id
        WHERE f.assigned_agent_id = ?
        ORDER BY f.updated_at DESC`, [req.user.id]);
    }
    const enriched = await Promise.all(fields.map(enrichField));
    return res.json(enriched);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/fields/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const field = await get(`
      SELECT f.*, u.name AS agent_name, u.email AS agent_email
      FROM fields f LEFT JOIN users u ON f.assigned_agent_id = u.id
      WHERE f.id = ?`, [req.params.id]);
    if (!field) return res.status(404).json({ error: 'Field not found' });
    if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });
    const updates = await all(`
      SELECT fu.*, u.name AS agent_name
      FROM field_updates fu JOIN users u ON fu.agent_id = u.id
      WHERE fu.field_id = ? ORDER BY fu.created_at DESC`, [field.id]);
    const enriched = await enrichField(field);
    return res.json({ ...enriched, updates });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/fields
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, crop_type, planting_date, stage, location, size_hectares, assigned_agent_id } = req.body;
    if (!name || !crop_type || !planting_date)
      return res.status(400).json({ error: 'name, crop_type, and planting_date are required' });
    const validStages = ['Planted','Growing','Ready','Harvested'];
    const fieldStage = stage || 'Planted';
    if (!validStages.includes(fieldStage)) return res.status(400).json({ error: 'Invalid stage' });
    if (assigned_agent_id) {
      const agent = await get("SELECT id FROM users WHERE id = ? AND role = 'agent'", [assigned_agent_id]);
      if (!agent) return res.status(400).json({ error: 'Invalid agent ID' });
    }
    const result = await run(
      `INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by)
       VALUES (?,?,?,?,?,?,?,?)`,
      [name, crop_type, planting_date, fieldStage, location||null, size_hectares||null, assigned_agent_id||null, req.user.id]
    );
    const field = await get('SELECT * FROM fields WHERE id = ?', [result.lastInsertRowid]);
    return res.status(201).json(await enrichField(field));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/fields/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const field = await get('SELECT * FROM fields WHERE id = ?', [req.params.id]);
    if (!field) return res.status(404).json({ error: 'Field not found' });

    if (req.user.role === 'agent') {
      if (field.assigned_agent_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
      const { stage, notes } = req.body;
      const validStages = ['Planted','Growing','Ready','Harvested'];
      if (stage && !validStages.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });
      const newStage = stage || field.stage;
      await run('UPDATE fields SET stage = ? WHERE id = ?', [newStage, field.id]);
      await run(
        'INSERT INTO field_updates (field_id,agent_id,previous_stage,new_stage,notes) VALUES (?,?,?,?,?)',
        [field.id, req.user.id, field.stage, newStage, notes||null]
      );
      const updated = await get('SELECT * FROM fields WHERE id = ?', [field.id]);
      return res.json(await enrichField(updated));
    }

    // Admin path
    const { name, crop_type, planting_date, stage, location, size_hectares, assigned_agent_id, notes } = req.body;
    const validStages = ['Planted','Growing','Ready','Harvested'];
    if (stage && !validStages.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });
    const newStage = stage || field.stage;
    const newAgentId = assigned_agent_id !== undefined ? (assigned_agent_id || null) : field.assigned_agent_id;
    await run(
      `UPDATE fields SET
        name=COALESCE(?,name), crop_type=COALESCE(?,crop_type), planting_date=COALESCE(?,planting_date),
        stage=?, location=COALESCE(?,location), size_hectares=COALESCE(?,size_hectares), assigned_agent_id=?
       WHERE id=?`,
      [name||null, crop_type||null, planting_date||null, newStage, location||null, size_hectares||null, newAgentId, field.id]
    );
    if (stage && stage !== field.stage) {
      await run(
        'INSERT INTO field_updates (field_id,agent_id,previous_stage,new_stage,notes) VALUES (?,?,?,?,?)',
        [field.id, req.user.id, field.stage, stage, notes||'Stage updated by coordinator']
      );
    }
    const updated = await get(`
      SELECT f.*, u.name AS agent_name FROM fields f
      LEFT JOIN users u ON f.assigned_agent_id = u.id WHERE f.id = ?`, [field.id]);
    return res.json(await enrichField(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/fields/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const field = await get('SELECT id FROM fields WHERE id = ?', [req.params.id]);
    if (!field) return res.status(404).json({ error: 'Field not found' });
    await run('DELETE FROM fields WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Field deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
