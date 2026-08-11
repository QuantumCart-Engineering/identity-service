import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/jwt";
import { JwtPayload } from "../utils/jwt";
import { AppError } from "../utils/app-error";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        next(new AppError("Authentication token is required", 401));
        return;
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        next(new AppError("Invalid authentication header", 401));
        return;
    }

    try {
        const decoded = jwt.verify(
            token,
            JWT_SECRET
        ) as JwtPayload;

        req.user = decoded;

        next();
    } catch {
        next(new AppError("Invalid or expired token", 401));
    }
};