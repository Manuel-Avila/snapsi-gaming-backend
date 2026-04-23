import "dotenv/config";
import mysql from "mysql2/promise";

let dbConfig = {};

if (process.env.NODE_ENV === "production") {
  dbConfig = {
    host: process.env.PRODUCTION_DB_HOST,
    port: process.env.PRODUCTION_DB_PORT || 3306,
    user: process.env.PRODUCTION_DB_USER,
    password: process.env.PRODUCTION_DB_PASSWORD,
    database: process.env.PRODUCTION_DB_NAME,
  };
} else if (process.env.NODE_ENV === "development") {
  dbConfig = {
    host: process.env.DEVELOPMENT_DB_HOST,
    port: process.env.DEVELOPMENT_DB_PORT || 3306,
    user: process.env.DEVELOPMENT_DB_USER,
    password: process.env.DEVELOPMENT_DB_PASSWORD,
    database: process.env.DEVELOPMENT_DB_NAME,
  };
}

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// pool
//   .getConnection()
//   .then(() => {
//     console.log("Database connected successfully.");
//   })
//   .catch((error) => {
//     console.error("Database connection failed:", error);
//   });

export default pool;
