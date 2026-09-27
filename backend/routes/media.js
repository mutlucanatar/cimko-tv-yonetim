const express = require("express");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

module.exports = (db, upload) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json(db.prepare("SELECT * FROM media ORDER BY created_at DESC").all());
  });

  // Gerçek dosya yükleme: görsel veya video (diskte /uploads altında saklanır)
  router.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Dosya bulunamadı" });
    const kind = req.file.mimetype.startsWith("video") ? "video" : "image";
    const id = randomUUID();
    const created_at = new Date().toISOString();
    const src = "/uploads/" + req.file.filename;
    const durationSec = req.body.durationSec ? Number(req.body.durationSec) : kind === "image" ? 8 : null;
    db.prepare(
      "INSERT INTO media (id, name, kind, src, duration_sec, created_at) VALUES (?,?,?,?,?,?)"
    ).run(id, req.file.originalname, kind, src, durationSec, created_at);
    res.status(201).json({ id, name: req.file.originalname, kind, src, durationSec, created_at });
  });

  // Harici video bağlantısı ekleme (ör. şirket CDN / dosya sunucusu linki)
  router.post("/link", (req, res) => {
    const { name, url } = req.body;
    if (!url) return res.status(400).json({ error: "URL zorunlu" });
    const id = randomUUID();
    const created_at = new Date().toISOString();
    db.prepare(
      "INSERT INTO media (id, name, kind, src, duration_sec, created_at) VALUES (?,?,?,?,?,?)"
    ).run(id, name || url.split("/").pop(), "video", url, null, created_at);
    res.status(201).json({ id, name: name || url, kind: "video", src: url, created_at });
  });

  router.delete("/:id", (req, res) => {
    const row = db.prepare("SELECT * FROM media WHERE id=?").get(req.params.id);
    if (row && row.src.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "..", row.src);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    db.prepare("DELETE FROM media WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
