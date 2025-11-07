import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4002;
const SERVICE = process.env.SERVICE_NAME || "products-api";
const USERS_API_URL = process.env.USERS_API_URL || "http://users-api:4001";

// Health de servicio
app.get("/health", (_req, res) => res.json({ status: "ok", service: SERVICE, driver: "pg" }));

// Health de BD (¡nuevo!)
app.get("/db/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    res.json({ ok: r.rows[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// ====================
// CRUD de Products
// ====================

// Listar productos
app.get("/products", async (_req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, name, price FROM products_schema.products ORDER BY id ASC"
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

// 🔗 Endpoint combinado con Users API (antes de :id)
app.get("/products/with-users", async (_req, res) => {
  try {
    const rProducts = await pool.query(
      "SELECT id, name, price FROM products_schema.products ORDER BY id ASC"
    );
    const rUsers = await fetch(`${USERS_API_URL}/users`).catch(() => ({ ok: false }));
    const users = rUsers && rUsers.ok ? await rUsers.json() : [];
    res.json({ products: rProducts.rows, usersCount: Array.isArray(users) ? users.length : 0 });
  } catch (e) {
    res.status(502).json({ error: "No se pudo consultar users-api", detail: String(e) });
  }
});

// Obtener producto por id
app.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid id" });

    const r = await pool.query(
      "SELECT id, name, price FROM products_schema.products WHERE id = $1",
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

// Crear producto
app.post("/products", async (req, res) => {
  const { name, price } = req.body ?? {};
  if (!name || price == null) return res.status(400).json({ error: "name & price required" });

  try {
    const r = await pool.query(
      "INSERT INTO products_schema.products(name, price) VALUES($1, $2) RETURNING id, name, price",
      [name, price]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "insert failed", detail: String(e) });
  }
});

// Editar producto (parcial o total)
app.put("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid id" });

  const { name, price } = req.body ?? {};
  if (name == null && price == null) return res.status(400).json({ error: "nothing to update" });

  const sets = [];
  const vals = [];
  let i = 1;
  if (name != null) { sets.push(`name = $${i++}`); vals.push(name); }
  if (price != null) { sets.push(`price = $${i++}`); vals.push(price); }
  vals.push(id);

  try {
    const r = await pool.query(
      `UPDATE products_schema.products SET ${sets.join(", ")} WHERE id = $${i} RETURNING id, name, price`,
      vals
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "update failed", detail: String(e) });
  }
});

// Eliminar producto
app.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid id" });
    const r = await pool.query(
      "DELETE FROM products_schema.products WHERE id = $1 RETURNING id",
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ deleted: true, id: r.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: "delete failed", detail: String(e) });
  }
});

// ====================

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE} listening on http://localhost:${PORT}`);
  console.log(`↔️  USERS_API_URL=${USERS_API_URL}`);
});
