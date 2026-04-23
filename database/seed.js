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
        "Manuel Avila",
        "manuel_avilam",
        "manuelavila@gmail.com",
        passwordHash,
        "male",
        21,
        "Just a person.",
      ],
    });

    connection = await db.getConnection();
    await connection.beginTransaction();

    for (const statement of statements) {
      await connection.query(statement.query, statement.values);
    }

    await connection.commit();

    console.log("✅ Database seeding completed successfully.");
  } catch (err) {
    console.error("❌ Database seeding failed:", err);
    await connection.rollback();
  } finally {
    if (connection) connection.release();
    process.exit();
  }
})();
