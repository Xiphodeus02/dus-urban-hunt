// Zero-Dependency-Server: statische Dateien + Team-Sync + Rangliste + Spielleiter-Ansicht.
// Start: node server.js   (optional: PORT=8000 ADMIN_PIN=1234)
const http = require("http"), fs = require("fs"), path = require("path");
const PORT = process.env.PORT || 8000;
const ADMIN_PIN = process.env.ADMIN_PIN || "1234";
const ROOT = __dirname, DATA = path.join(ROOT, "data.json"), UP = path.join(ROOT, "uploads");
if (!fs.existsSync(UP)) fs.mkdirSync(UP);
let db = { teams: {} };
try { db = JSON.parse(fs.readFileSync(DATA, "utf8")); } catch (e) {}
const persist = () => fs.writeFile(DATA, JSON.stringify(db), () => {});
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".jpg": "image/jpeg" };

function body(req, limit = 4e6) {
  return new Promise((res, rej) => {
    let b = "";
    req.on("data", c => { b += c; if (b.length > limit) { rej(new Error("too large")); req.destroy(); } });
    req.on("end", () => { try { res(JSON.parse(b || "{}")); } catch (e) { rej(e); } });
  });
}
const send = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
const safe = s => String(s).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);

function board() {
  return Object.values(db.teams).map(t => ({
    team: t.team, points: t.points, stations: t.stations, finished: !!t.finished,
    minutes: t.finished ? t.minutes : Math.round((Date.now() - t.startedAt) / 60000), updated: t.updated
  })).sort((a, b) => b.points - a.points || a.minutes - b.minutes);
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (req.method === "POST" && url.pathname === "/api/sync") {
      const d = await body(req);
      if (!d.id || !d.team) return send(res, 400, { error: "bad" });
      const key = safe(d.team).toLowerCase();
      const ex = db.teams[key];
      if (ex && ex.id !== d.id) return send(res, 409, { error: "Teamname vergeben" });
      db.teams[key] = {
        id: d.id, team: String(d.team).slice(0, 30), points: +d.points || 0, stations: +d.stations || 0,
        finished: !!d.finished, minutes: +d.minutes || 0, startedAt: +d.startedAt || Date.now(),
        answers: d.answers || {}, photos: ex ? ex.photos : {}, updated: Date.now()
      };
      persist();
      return send(res, 200, { ok: true, board: board() });
    }
    if (req.method === "POST" && url.pathname === "/api/photo") {
      const d = await body(req, 8e6);
      const key = safe(d.team).toLowerCase(), t = db.teams[key];
      if (!t || t.id !== d.id || !/^data:image\/jpeg;base64,/.test(d.data || "")) return send(res, 400, { error: "bad" });
      const file = `${key}_${safe(d.key)}.jpg`;
      fs.writeFileSync(path.join(UP, file), Buffer.from(d.data.split(",")[1], "base64"));
      t.photos[d.key] = file; persist();
      return send(res, 200, { ok: true });
    }
    if (url.pathname === "/api/leaderboard") return send(res, 200, board());
    if (url.pathname === "/api/admin") {
      if (url.searchParams.get("pin") !== ADMIN_PIN) return send(res, 403, { error: "pin" });
      return send(res, 200, Object.values(db.teams).map(({ id, ...t }) => t));
    }
    // Statische Dateien
    let p = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const full = path.normalize(path.join(ROOT, p));
    const allowed = [path.join(ROOT, "index.html"), path.join(ROOT, "admin.html"), path.join(ROOT, "manifest.json"), path.join(ROOT, "sw.js")];
    if (!(allowed.includes(full) || full.startsWith(UP + path.sep))) { res.writeHead(404); return res.end("Not found"); }
    fs.readFile(full, (e, data) => {
      if (e) { res.writeHead(404); return res.end("Not found"); }
      res.writeHead(200, { "Content-Type": MIME[path.extname(full)] || "application/octet-stream" });
      res.end(data);
    });
  } catch (e) { send(res, 500, { error: String(e.message) }); }
}).listen(PORT, () => console.log(`Düsseldorf Quest läuft auf http://localhost:${PORT}  (Admin: /admin.html, PIN ${ADMIN_PIN})`));
