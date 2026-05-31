import db from "../config/database.js";
import bcrypt from "bcryptjs";

const statements = [];

(async () => {
  console.log("🌱 Starting database seeding...");
  let connection;

  try {
    const passwordHash = await bcrypt.hash("secret", 10);
    statements.push({
      query:
        "INSERT INTO users (name, username, email, password, gender, age, bio) VALUES (?, ?, ?, ?, ?, ?, ?)",
      values: [
        "Tester",
        "secret",
        "secret@gmail.com",
        passwordHash,
        "male",
        21,
        "Just a person.",
      ],
    });

    connection = await db.getConnection();
    await connection.query("BEGIN");

    for (const statement of statements) {
      await connection.query(statement.query, statement.values);
    }

    await connection.query("COMMIT");

    console.log("✅ Database seeding completed successfully.");
  } catch (err) {
    console.error("❌ Database seeding failed:", err);
    if (connection) await connection.query("ROLLBACK");
  } finally {
    if (connection) connection.release();
    process.exit();
  }
})();
