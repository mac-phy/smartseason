const bcrypt = require('bcryptjs');
const { initSchema, run, get, all } = require('./init');

async function seed() {
  await initSchema();
  console.log('Seeding database...');

  await run('DELETE FROM field_updates');
  await run('DELETE FROM fields');
  await run('DELETE FROM users');

  const hash = (p) => bcrypt.hashSync(p, 10);

  const admin = await run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
    ['Sarah Coordinator','admin@smartseason.com',hash('admin123'),'admin']);
  const a1 = await run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
    ['James Mwangi','james@smartseason.com',hash('agent123'),'agent']);
  const a2 = await run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
    ['Grace Wanjiku','grace@smartseason.com',hash('agent123'),'agent']);
  const a3 = await run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
    ['Peter Kamau','peter@smartseason.com',hash('agent123'),'agent']);

  const daysAgo = (n) => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0]; };

  const fields = [
    ['Sunrise Plot A','Maize',daysAgo(80),'Ready','Kiambu North',3.5,a1.lastInsertRowid,admin.lastInsertRowid],
    ['Sunrise Plot B','Beans',daysAgo(45),'Growing','Kiambu North',2.0,a1.lastInsertRowid,admin.lastInsertRowid],
    ['Valley Green','Tomatoes',daysAgo(120),'Harvested','Kiambu South',1.5,a1.lastInsertRowid,admin.lastInsertRowid],
    ['Hilltop Field','Wheat',daysAgo(10),'Planted','Kiambu East',5.0,a1.lastInsertRowid,admin.lastInsertRowid],
    ['Riverside Farm 1','Rice',daysAgo(95),'Ready','Muranga Central',4.0,a2.lastInsertRowid,admin.lastInsertRowid],
    ['Riverside Farm 2','Sugarcane',daysAgo(200),'Growing','Muranga Central',6.5,a2.lastInsertRowid,admin.lastInsertRowid],
    ['Golden Acres','Maize',daysAgo(5),'Planted','Muranga West',3.0,a2.lastInsertRowid,admin.lastInsertRowid],
    ['Eastern Plains','Sorghum',daysAgo(60),'Growing','Thika East',8.0,a3.lastInsertRowid,admin.lastInsertRowid],
    ['Mango Grove','Mango',daysAgo(150),'Harvested','Thika West',2.5,a3.lastInsertRowid,admin.lastInsertRowid],
    ['New Clearance','Beans',daysAgo(3),'Planted','Thika North',1.8,a3.lastInsertRowid,admin.lastInsertRowid],
    ['Reserve Block','Maize',daysAgo(70),'Growing','Central Hub',4.2,null,admin.lastInsertRowid],
  ];

  const fids = [];
  for (const f of fields) {
    const r = await run(
      'INSERT INTO fields (name,crop_type,planting_date,stage,location,size_hectares,assigned_agent_id,created_by) VALUES (?,?,?,?,?,?,?,?)', f
    );
    fids.push(r.lastInsertRowid);
  }

  const hoursAgo = (h) => { const d=new Date(); d.setHours(d.getHours()-h); return d.toISOString().replace('T',' ').split('.')[0]; };

  const updates = [
    [fids[0],a1.lastInsertRowid,'Growing','Ready','Ears fully formed. Husks dry and peeling back nicely. Ready for harvest assessment.',hoursAgo(12)],
    [fids[1],a1.lastInsertRowid,'Planted','Growing','Seedlings at 15cm. Uniform germination across the plot. Applied second round of fertilizer.',hoursAgo(48)],
    [fids[4],a2.lastInsertRowid,'Growing','Ready','Grain filling complete. Moisture levels checked — within acceptable range. Awaiting harvest crew.',hoursAgo(6)],
    [fids[5],a2.lastInsertRowid,'Planted','Growing','Cane emerging well. Weed pressure moderate in the northern section — manual removal done.',hoursAgo(120)],
    [fids[7],a3.lastInsertRowid,'Planted','Growing','Good germination rate (~90%). Irrigation system functional. One blocked sprinkler fixed.',hoursAgo(72)],
  ];

  for (const u of updates) {
    await run(
      'INSERT INTO field_updates (field_id,agent_id,previous_stage,new_stage,notes,created_at) VALUES (?,?,?,?,?,?)', u
    );
  }

  console.log('\n✅ Seed complete!');
  console.log('  Admin:  admin@smartseason.com / admin123');
  console.log('  Agent1: james@smartseason.com  / agent123');
  console.log('  Agent2: grace@smartseason.com  / agent123');
  console.log('  Agent3: peter@smartseason.com  / agent123');
}

module.exports = { seed };
if (require.main === module) {
  seed().catch(e => { console.error(e); process.exit(1); });
}