import mysql from "mysql2/promise";

// Persist pool across Next.js HMR reloads in dev — otherwise each module reload
// creates a new pool, and connections accumulate until MySQL hits max_connections.
const globalForDb = globalThis as unknown as { __dbPool?: mysql.Pool };

// Timezone the shop operates in. Pinned so NOW()-based logic (promo windows,
// countdowns, deadlines) matches admin-entered wall-clock times regardless of
// the server's OS/MySQL timezone (e.g. Hostinger defaults to UTC).
const DB_TIMEZONE = process.env.DB_TIMEZONE || "+07:00"; // WIB

function createPool(): mysql.Pool {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "onlineshop",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    idleTimeout: 60_000,
    enableKeepAlive: true,
    // Interpret DATETIME/TIMESTAMP columns as WIB when converting to JS Date,
    // matching the session time_zone set below. Without this, mysql2 uses the
    // server OS timezone (Hostinger = UTC) and reads a WIB wall-clock value as
    // UTC — shifting every deadline/countdown by +7h (e.g. a 60-min payment
    // window shows ~480 min). Keep this in sync with DB_TIMEZONE.
    timezone: DB_TIMEZONE,
  });

  // Set the session time zone on every new pooled connection.
  pool.on("connection", (conn) => {
    conn.query(`SET time_zone = '${DB_TIMEZONE}'`);
  });

  return pool;
}

export const db = globalForDb.__dbPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__dbPool = db;
}
