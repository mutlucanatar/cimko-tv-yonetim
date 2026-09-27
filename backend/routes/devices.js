const express = require("express");
const { randomUUID } = require("crypto");

module.exports = (db) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json(db.prepare("SELECT * FROM devices ORDER BY created_at DESC").all());
  });

  router.post("/", (req, res) => {
    const { title, branchId, groupId, scenarioId, status, os } = req.body;
    if (!title) return res.status(400).json({ error: "Başlık zorunlu" });
    const id = randomUUID();
    const created_at = new Date().toISOString();
    db.prepare(
      `INSERT INTO devices (id, title, branch_id, group_id, scenario_id, status, os, created_at)
       VALUES (?,?,?,?,?,?,?,?)`
    ).run(id, title, branchId || null, groupId || null, scenarioId || null, status || "Aktif", os || null, created_at);
    res.status(201).json({ id, title, branchId, groupId, scenarioId, status: status || "Aktif", os, created_at });
  });

  router.put("/:id", (req, res) => {
    const { title, branchId, groupId, scenarioId, status, os } = req.body;
    const exists = db.prepare("SELECT id FROM devices WHERE id=?").get(req.params.id);
    if (!exists) return res.status(404).json({ error: "Cihaz bulunamadı" });
    db.prepare(
      `UPDATE devices SET title=?, branch_id=?, group_id=?, scenario_id=?, status=?, os=? WHERE id=?`
    ).run(title, branchId || null, groupId || null, scenarioId || null, status || "Aktif", os || null, req.params.id);
    res.json({ ok: true });
  });

  router.delete("/:id", (req, res) => {
    db.prepare("DELETE FROM devices WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
