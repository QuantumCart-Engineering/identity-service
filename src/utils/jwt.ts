import jwt from "jsonwebtoken";

import {
    JWT_SECRET,
    JWT_EXPIRES_IN
} from "../config/jwt";

export interface JwtPayload {
    userId: string;
    email: string;
}

export const generateAccessToken = (
    payload: JwtPayload
): string => {
    return jwt.sign(
        payload,
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN
        }
    );
};