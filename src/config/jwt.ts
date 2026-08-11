import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
}

export const JWT_SECRET = jwtSecret;

export const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "15m";