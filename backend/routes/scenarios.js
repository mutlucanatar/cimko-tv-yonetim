const express = require("express");
const { randomUUID } = require("crypto");

function saveItems(db, scenarioId, items) {
  const stmt = db.prepare(
    `INSERT INTO scenario_items (id, scenario_id, media_id, position, start_date, end_date, duration_sec)
     VALUES (?,?,?,?,?,?,?)`
  );
  (items || []).forEach((it, i) =>
    stmt.run(randomUUID(), scenarioId, it.mediaId, i, it.startDate || null, it.endDate || null, it.durationSec || null)
  );
}

function assignDevices(db, scenarioId, deviceIds) {
  db.prepare("UPDATE devices SET scenario_id=NULL WHERE scenario_id=?").run(scenarioId);
  const stmt = db.prepare("UPDATE devices SET scenario_id=? WHERE id=?");
  (deviceIds || []).forEach((id) => stmt.run(scenarioId, id));
}

function loadFull(db, s) {
  const items = db
    .prepare("SELECT * FROM scenario_items WHERE scenario_id=? ORDER BY position ASC")
    .all(s.id)
    .map((it) => ({ mediaId: it.media_id, startDate: it.start_date, endDate: it.end_date, durationSec: it.duration_sec }));
  const deviceIds = db.prepare("SELECT id FROM devices WHERE scenario_id=?").all(s.id).map((r) => r.id);
  return { ...s, items, deviceIds };
}

module.exports = (db) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    const scenarios = db.prepare("SELECT * FROM scenarios ORDER BY created_at DESC").all();
    res.json(scenarios.map((s) => loadFull(db, s)));
  });

  router.post("/", (req, res) => {
    const { title, items = [], deviceIds = [] } = req.body;
    if (!title) return res.status(400).json({ error: "Başlık zorunlu" });
    const id = randomUUID();
    const created_at = new Date().toISOString();
    db.prepare("INSERT INTO scenarios (id, title, created_at) VALUES (?,?,?)").run(id, title, created_at);
    saveItems(db, id, items);
    assignDevices(db, id, deviceIds);
    res.status(201).json({ id, title, items, deviceIds, created_at });
  });

  router.put("/:id", (req, res) => {
    const { title, items = [], deviceIds = [] } = req.body;
    const exists = db.prepare("SELECT id FROM scenarios WHERE id=?").get(req.params.id);
    if (!exists) return res.status(404).json({ error: "Senaryo bulunamadı" });
    db.prepare("UPDATE scenarios SET title=? WHERE id=?").run(title, req.params.id);
    db.prepare("DELETE FROM scenario_items WHERE scenario_id=?").run(req.params.id);
    saveItems(db, req.params.id, items);
    assignDevices(db, req.params.id, deviceIds);
    res.json({ ok: true });
  });

  router.delete("/:id", (req, res) => {
    db.prepare("UPDATE devices SET scenario_id=NULL WHERE scenario_id=?").run(req.params.id);
    db.prepare("DELETE FROM scenario_items WHERE scenario_id=?").run(req.params.id);
    db.prepare("DELETE FROM scenarios WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
