import mysql from "mysql2/promise";

// Persist pool across Next.js HMR reloads in dev — otherwise each module reload
// creates a new pool, and connections accumulate until MySQL hits max_connections.
const globalForDb = globalThis as unknown as { __dbPool?: mysql.Pool };

export const db =
  globalForDb.__dbPool ??
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "onlineshop",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    idleTimeout: 60_000,
    enableKeepAlive: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__dbPool = db;
}
