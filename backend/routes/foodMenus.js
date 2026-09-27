const express = require("express");
const { randomUUID } = require("crypto");

function loadFull(r) {
  return { ...r, tags: JSON.parse(r.tags_json || "[]"), foods: JSON.parse(r.foods_json || "[]") };
}

module.exports = (db) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    const rows = db.prepare("SELECT * FROM food_menus ORDER BY date DESC").all();
    res.json(rows.map(loadFull));
  });

  router.post("/", (req, res) => {
    const { date, tags = [], foods = [] } = req.body;
    if (!date) return res.status(400).json({ error: "Tarih zorunlu" });
    const id = randomUUID();
    db.prepare("INSERT INTO food_menus (id, date, tags_json, foods_json) VALUES (?,?,?,?)").run(
      id,
      date,
      JSON.stringify(tags),
      JSON.stringify(foods)
    );
    res.status(201).json({ id, date, tags, foods });
  });

  router.put("/:id", (req, res) => {
    const { date, tags = [], foods = [] } = req.body;
    db.prepare("UPDATE food_menus SET date=?, tags_json=?, foods_json=? WHERE id=?").run(
      date,
      JSON.stringify(tags),
      JSON.stringify(foods),
      req.params.id
    );
    res.json({ ok: true });
  });

  router.delete("/:id", (req, res) => {
    db.prepare("DELETE FROM food_menus WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
