-- 1) Crear schema
CREATE SCHEMA IF NOT EXISTS products_schema AUTHORIZATION afcbadmin;

-- 2) Crear tabla dentro del schema
CREATE TABLE IF NOT EXISTS products_schema.products (
  id SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL
);

-- 3) (Opcional) Dar privilegios al usuario administrador
GRANT ALL PRIVILEGES ON SCHEMA products_schema TO afcbadmin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA products_schema TO afcbadmin;
