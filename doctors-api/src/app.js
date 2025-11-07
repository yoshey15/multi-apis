import express from "express";
import cors from "cors";
import { pool, ensureSchema } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4003;

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "doctors-api", driver: "pg" })
);

// Ping liviano a la BD
app.get("/db/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    res.json({ ok: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// CRUD básico
app.get("/doctors", async (_req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, name, specialty, email FROM clinic_schema.doctors ORDER BY id ASC"
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

app.get("/doctors/:id", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, name, specialty, email FROM clinic_schema.doctors WHERE id=$1",
      [req.params.id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

app.post("/doctors", async (req, res) => {
  const { name, specialty, email } = req.body ?? {};
  if (!name || !specialty)
    return res.status(400).json({ error: "name & specialty required" });
  try {
    const r = await pool.query(
      "INSERT INTO clinic_schema.doctors(name, specialty, email) VALUES($1,$2,$3) RETURNING id, name, specialty, email",
      [name, specialty, email ?? null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "insert failed", detail: String(e) });
  }
});

app.put("/doctors/:id", async (req, res) => {
  const { name, specialty, email } = req.body ?? {};
  try {
    const r = await pool.query(
      `UPDATE clinic_schema.doctors
       SET name = COALESCE($1, name),
           specialty = COALESCE($2, specialty),
           email = COALESCE($3, email)
       WHERE id=$4
       RETURNING id, name, specialty, email`,
      [name ?? null, specialty ?? null, email ?? null, req.params.id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "update failed", detail: String(e) });
  }
});

app.delete("/doctors/:id", async (req, res) => {
  try {
    const r = await pool.query(
      "DELETE FROM clinic_schema.doctors WHERE id=$1",
      [req.params.id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "not found" });
    res.json({ message: "deleted" });
  } catch (e) {
    res.status(500).json({ error: "delete failed", detail: String(e) });
  }
});

app.listen(PORT, async () => {
  try {
    await ensureSchema();
    console.log(`✅ doctors-api on http://localhost:${PORT}`);
  } catch (e) {
    console.error("❌ ensureSchema failed:", e);
  }
});
