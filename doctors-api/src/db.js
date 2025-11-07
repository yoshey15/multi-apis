import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL, // Debe traer ?sslmode=require
  ssl: { rejectUnauthorized: false }
});

// Crea esquema/tabla si no existen (arranque)
export async function ensureSchema() {
  const sql = `
    CREATE SCHEMA IF NOT EXISTS clinic_schema AUTHORIZATION CURRENT_USER;
    CREATE TABLE IF NOT EXISTS clinic_schema.doctors (
      id SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      specialty  TEXT NOT NULL,
      email      TEXT UNIQUE
    );
  `;
  await pool.query(sql);
}
