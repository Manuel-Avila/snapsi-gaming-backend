import "dotenv/config";
import pg from "pg";

let dbConfig = {};

if (process.env.NODE_ENV === "production") {
  dbConfig = {
    host: process.env.PRODUCTION_DB_HOST,
    port: process.env.PRODUCTION_DB_PORT || 5432,
    user: process.env.PRODUCTION_DB_USER,
    password: process.env.PRODUCTION_DB_PASSWORD,
    database: process.env.PRODUCTION_DB_NAME,
  };
} else if (process.env.NODE_ENV === "development") {
  dbConfig = {
    host: process.env.DEVELOPMENT_DB_HOST,
    port: process.env.DEVELOPMENT_DB_PORT || 5432,
    user: process.env.DEVELOPMENT_DB_USER,
    password: process.env.DEVELOPMENT_DB_PASSWORD,
    database: process.env.DEVELOPMENT_DB_NAME,
  };
}

const pool = new pg.Pool({
  ...dbConfig,
  max: 10,
});

// Helper to convert MySQL '?' placeholders to PostgreSQL '$1, $2' format
const convertQuery = (sql) => {
  let paramCount = 1;
  return sql.replace(/\?/g, () => `$${paramCount++}`);
};

const db = {
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: async (sql, values) => {
        const res = await client.query(convertQuery(sql), values);
        if (["UPDATE", "DELETE"].includes(res.command) && !sql.toLowerCase().includes("returning")) {
          return [{ affectedRows: res.rowCount }, res.fields];
        }
        return [res.rows, res.fields];
      },
      execute: async (sql, values) => {
        const res = await client.query(convertQuery(sql), values);
        if (["UPDATE", "DELETE"].includes(res.command) && !sql.toLowerCase().includes("returning")) {
          return [{ affectedRows: res.rowCount }, res.fields];
        }
        return [res.rows, res.fields];
      },
      release: () => client.release(),
    };
  },
  query: async (sql, values) => {
    const res = await pool.query(convertQuery(sql), values);
    if (["UPDATE", "DELETE"].includes(res.command) && !sql.toLowerCase().includes("returning")) {
      return [{ affectedRows: res.rowCount }, res.fields];
    }
    return [res.rows, res.fields];
  },
  execute: async (sql, values) => {
    const res = await pool.query(convertQuery(sql), values);
    if (["UPDATE", "DELETE"].includes(res.command) && !sql.toLowerCase().includes("returning")) {
      return [{ affectedRows: res.rowCount }, res.fields];
    }
    return [res.rows, res.fields];
  },
};

export default db;
