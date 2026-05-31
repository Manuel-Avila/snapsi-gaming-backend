import db from "../config/database.js";

// Before executing the migration, ensure that the database is already created
// CREATE DATABASE snapsi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        bio TEXT,
        profile_picture_url VARCHAR(255),
        image_cloudinary_id VARCHAR(255),
        gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
        age SMALLINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
  `CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        image_url TEXT NOT NULL,
        image_cloudinary_id VARCHAR(255),
        caption TEXT,
        tags JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`,
  `CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`,
  `CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );`,
  `CREATE TABLE IF NOT EXISTS post_likes (
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );`,
  `CREATE TABLE IF NOT EXISTS bookmarks (
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );`,
  `CREATE TABLE IF NOT EXISTS game_reviews (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        game_id INT NOT NULL,
        game_name VARCHAR(255) NOT NULL,
        game_image TEXT,
        rating SMALLINT NOT NULL CHECK (rating <= 100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, game_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`,
  `CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        recipient_user_id INT NOT NULL, 
        sender_user_id INT NOT NULL, 
        type VARCHAR(10) NOT NULL CHECK (type IN ('like', 'comment')),
        post_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );`,
];

(async () => {
  console.log("🚧 Starting database migration...");
  let connection;

  try {
    connection = await db.getConnection();

    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log("✅ Database migration completed successfully.");
  } catch (err) {
    console.error("❌ Database migration failed:", err);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
})();
