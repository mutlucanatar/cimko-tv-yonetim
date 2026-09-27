require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { randomUUID } = require("crypto");

const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, randomUUID() + ext);
  },
});
// Yemekhane/antre ekranları için görsel ve video dosyaları; 500MB'a kadar
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

app.use("/api/branches", require("./routes/branches")(db));
app.use("/api/groups", require("./routes/groups")(db));
app.use("/api/devices", require("./routes/devices")(db));
app.use("/api/media", require("./routes/media")(db, upload));
app.use("/api/scenarios", require("./routes/scenarios")(db));
app.use("/api/rules", require("./routes/rules")(db));
app.use("/api/food-menus", require("./routes/foodMenus")(db));

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Beklenmedik hatalar için genel yakalayıcı (ör. multer dosya boyutu aşımı)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Sunucu hatası" });
});

app.listen(PORT, () => {
  console.log(`Çimko TV Yönetimi API http://localhost:${PORT} adresinde çalışıyor`);
});
