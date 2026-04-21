/**
 * Field Status Logic
 * 
 * Status is computed from stage + planting date + last update time.
 *
 * Rules:
 *  - "Completed"  → stage is 'Harvested'
 *  - "At Risk"    → any of:
 *      • stage is 'Ready' but planted > 120 days ago (overdue for harvest)
 *      • stage is 'Growing' but no update in last 14 days AND planted > 30 days ago
 *      • stage is 'Planted' but no update in last 7 days AND planted > 14 days ago
 *  - "Active"     → everything else (on track)
 */

const DAY_MS = 86400000;

function computeStatus(field, lastUpdateDate) {
  const { stage, planting_date } = field;
  const now = new Date();
  const planted = new Date(planting_date);
  const daysSincePlanting = Math.floor((now - planted) / DAY_MS);

  if (stage === 'Harvested') return 'Completed';

  const lastUpdate = lastUpdateDate ? new Date(lastUpdateDate) : planted;
  const daysSinceUpdate = Math.floor((now - lastUpdate) / DAY_MS);

  if (stage === 'Ready' && daysSincePlanting > 120) return 'At Risk';
  if (stage === 'Growing' && daysSinceUpdate > 14 && daysSincePlanting > 30) return 'At Risk';
  if (stage === 'Planted' && daysSinceUpdate > 7 && daysSincePlanting > 14) return 'At Risk';

  return 'Active';
}

module.exports = { computeStatus };
