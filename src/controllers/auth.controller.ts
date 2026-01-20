import { Request, Response } from "express";
import { registerUser } from "../services/auth.service";
import { loginUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, college } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "name, email, password, and role are required"
      });
    }

    // Normalize role to DB enum
    const normalizedRole = role.toUpperCase();

    if (!["STUDENT", "ADMIN"].includes(normalizedRole)) {
      return res.status(400).json({
        message: "Invalid role. Allowed values: STUDENT, ADMIN"
      });
    }

    const user = await registerUser(
      name,
      email,
      password,
      normalizedRole,
      college
    );

    return res.status(201).json({
      message: "User registered successfully",
      user
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Registration failed"
    });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const data = await loginUser(email, password);

    return res.status(200).json({
      message: "Login successful",
      token: data.token,
      user: data.user
    });
  } catch (error: any) {
    return res.status(401).json({
      message: error.message || "Login failed"
    });
  }
};
