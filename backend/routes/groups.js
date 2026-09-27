const express = require("express");
const { randomUUID } = require("crypto");

function assignDevices(db, groupId, deviceIds) {
  db.prepare("UPDATE devices SET group_id=NULL WHERE group_id=?").run(groupId);
  const stmt = db.prepare("UPDATE devices SET group_id=? WHERE id=?");
  (deviceIds || []).forEach((id) => stmt.run(groupId, id));
}

module.exports = (db) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    const groups = db.prepare("SELECT * FROM groups_tbl ORDER BY created_at DESC").all();
    const withDevices = groups.map((g) => ({
      ...g,
      deviceIds: db.prepare("SELECT id FROM devices WHERE group_id=?").all(g.id).map((r) => r.id),
    }));
    res.json(withDevices);
  });

  router.post("/", (req, res) => {
    const { title, deviceIds = [] } = req.body;
    if (!title) return res.status(400).json({ error: "Başlık zorunlu" });
    const id = randomUUID();
    const created_at = new Date().toISOString();
    db.prepare("INSERT INTO groups_tbl (id, title, created_at) VALUES (?,?,?)").run(id, title, created_at);
    assignDevices(db, id, deviceIds);
    res.status(201).json({ id, title, created_at, deviceIds });
  });

  router.put("/:id", (req, res) => {
    const { title, deviceIds = [] } = req.body;
    db.prepare("UPDATE groups_tbl SET title=? WHERE id=?").run(title, req.params.id);
    assignDevices(db, req.params.id, deviceIds);
    res.json({ ok: true });
  });

  router.delete("/:id", (req, res) => {
    db.prepare("UPDATE devices SET group_id=NULL WHERE group_id=?").run(req.params.id);
    db.prepare("DELETE FROM groups_tbl WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
