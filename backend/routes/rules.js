const express = require("express");
const { randomUUID } = require("crypto");

function assignDevices(db, ruleId, deviceIds) {
  db.prepare("DELETE FROM rule_devices WHERE rule_id=?").run(ruleId);
  const stmt = db.prepare("INSERT INTO rule_devices (rule_id, device_id) VALUES (?,?)");
  (deviceIds || []).forEach((id) => stmt.run(ruleId, id));
}

function loadFull(db, r) {
  return {
    ...r,
    days: JSON.parse(r.days_json),
    deviceIds: db.prepare("SELECT device_id FROM rule_devices WHERE rule_id=?").all(r.id).map((x) => x.device_id),
  };
}

module.exports = (db) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    const rules = db.prepare("SELECT * FROM rules ORDER BY created_at DESC").all();
    res.json(rules.map((r) => loadFull(db, r)));
  });

  router.post("/", (req, res) => {
    const { title, status, days, deviceIds = [] } = req.body;
    if (!title) return res.status(400).json({ error: "Kural adı zorunlu" });
    const id = randomUUID();
    const created_at = new Date().toISOString();
    db.prepare("INSERT INTO rules (id, title, status, days_json, created_at) VALUES (?,?,?,?,?)").run(
      id,
      title,
      status || "Aktif",
      JSON.stringify(days || {}),
      created_at
    );
    assignDevices(db, id, deviceIds);
    res.status(201).json({ id, title, status, days, deviceIds, created_at });
  });

  router.put("/:id", (req, res) => {
    const { title, status, days, deviceIds = [] } = req.body;
    db.prepare("UPDATE rules SET title=?, status=?, days_json=? WHERE id=?").run(
      title,
      status || "Aktif",
      JSON.stringify(days || {}),
      req.params.id
    );
    assignDevices(db, req.params.id, deviceIds);
    res.json({ ok: true });
  });

  router.delete("/:id", (req, res) => {
    db.prepare("DELETE FROM rule_devices WHERE rule_id=?").run(req.params.id);
    db.prepare("DELETE FROM rules WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
