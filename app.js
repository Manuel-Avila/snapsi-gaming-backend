import "dotenv/config";
import "./config/database.js";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import authRouter from "./routers/authRouter.js";
import postRouter from "./routers/postRouter.js";
import profileRouter from "./routers/profileRouter.js";
import userRouter from "./routers/userRouter.js";
import notificationRouter from "./routers/notificationRouter.js";
import gameRouter from "./routers/gameRouter.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected to socket: ${socket.user?.id}`);
  
  if (socket.user?.id) {
    socket.join(`user_${socket.user.id}`);
  }

  socket.on("disconnect", () => {
    console.log(`User disconnected from socket: ${socket.user?.id}`);
  });
});

app.set("io", io);

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
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
