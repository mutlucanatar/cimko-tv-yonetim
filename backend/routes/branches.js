const express = require("express");
const { randomUUID } = require("crypto");

module.exports = (db) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    const rows = db
      .prepare(
        `SELECT b.*, (SELECT COUNT(*) FROM devices d WHERE d.branch_id = b.id) AS device_count
         FROM branches b ORDER BY b.created_at DESC`
      )
      .all();
    res.json(rows);
  });

  router.post("/", (req, res) => {
    const { name, code, location, status } = req.body;
    if (!name) return res.status(400).json({ error: "Şube adı zorunlu" });
    const id = randomUUID();
    const created_at = new Date().toISOString();
    db.prepare(
      `INSERT INTO branches (id, name, code, location, status, created_at) VALUES (?,?,?,?,?,?)`
    ).run(id, name, code || null, location || null, status || "Aktif", created_at);
    res.status(201).json({ id, name, code, location, status: status || "Aktif", created_at, device_count: 0 });
  });

  router.put("/:id", (req, res) => {
    const { name, code, location, status } = req.body;
    const exists = db.prepare("SELECT id FROM branches WHERE id=?").get(req.params.id);
    if (!exists) return res.status(404).json({ error: "Şube bulunamadı" });
    db.prepare(`UPDATE branches SET name=?, code=?, location=?, status=? WHERE id=?`).run(
      name,
      code || null,
      location || null,
      status || "Aktif",
      req.params.id
    );
    res.json({ ok: true });
  });

  router.delete("/:id", (req, res) => {
    db.prepare("DELETE FROM branches WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
