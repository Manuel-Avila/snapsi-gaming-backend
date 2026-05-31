import db from "../config/database.js";

(async () => {
  if (process.env.NODE_ENV === `production`) {
    console.log("Dropping database in production is not allowed.");
    process.exit(1);
  }

  console.log("🚧 Starting database drop...");
  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );

    if (rows.length === 0) {
      console.log("✅ No hay tablas para borrar.");
      process.exit(0);
    }

    const tableNames = rows.map((row) => `"${row.table_name}"`).join(", ");

    await connection.query(`DROP TABLE IF EXISTS ${tableNames} CASCADE;`);

    console.log("✅ Database drop completed successfully.");
  } catch (err) {
    console.error("❌ Database drop failed:", err);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
})();
