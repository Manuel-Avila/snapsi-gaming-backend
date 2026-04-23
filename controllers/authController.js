import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as UserModel from "../models/userModel.js";

export const register = async (req, res) => {
  const { name, username, email, password, gender, age } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUserId = await UserModel.createUser({
      name,
      username,
      email,
      password: passwordHash,
      gender,
      age,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", userId: newUserId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "The email or username is already taken." });
    }

    console.error("Error while registering user:", error);
    res.status(500).json({ message: "Error while registering user." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.getUserForAuth(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const payload = { id: user.id, username: user.username };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "20d",
    });

    res.status(200).json({ token, message: "Login successful." });
  } catch (error) {
    console.error("Error while logging in user:", error);
    res.status(500).json({ message: "Error while logging in user." });
  }
};

export const googleLogin = async (req, res) => {};
