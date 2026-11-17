// Applies prisma/init.sql to the Turso database configured in .env.local.
// Usage: node --env-file=.env.local scripts/db-push.mjs
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({ url, authToken });
const sql = readFileSync(new URL("../prisma/init.sql", import.meta.url), "utf8").replace(/^﻿/, "");

// Make re-runs safe: only create what does not exist yet.
const safe = sql
  .replace(/CREATE TABLE "/g, 'CREATE TABLE IF NOT EXISTS "')
  .replace(/CREATE UNIQUE INDEX "/g, 'CREATE UNIQUE INDEX IF NOT EXISTS "')
  .replace(/CREATE INDEX "/g, 'CREATE INDEX IF NOT EXISTS "');

if (process.argv.includes("--reset")) {
  const t = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  for (const r of t.rows) await client.execute(`DROP TABLE IF EXISTS "${r.name}"`);
  console.log("Dropped existing tables");
}
await client.executeMultiple(safe);
const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log("Tables:", res.rows.map((r) => r.name).join(", "));
