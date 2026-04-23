import "dotenv/config";
import "./config/database.js";
import express from "express";
import cors from "cors";
import authRouter from "./routers/authRouter.js";
import postRouter from "./routers/postRouter.js";
import profileRouter from "./routers/profileRouter.js";
import userRouter from "./routers/userRouter.js";
import notificationRouter from "./routers/notificationRouter.js";
import gameRouter from "./routers/gameRouter.js";

const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/profile", profileRouter);
app.use("/api/user", userRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/games", gameRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
