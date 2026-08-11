import { Request, Response } from "express";

import { RegisterDto } from "../dtos/auth/register.dto";
import { LoginDto } from "../dtos/auth/login.dto";

import { AppError } from "../utils/app-error";

import {
    registerUser,
    loginUser,
    getCurrentUser as getCurrentUserService,
    refreshAccessToken,
    logoutUser
} from "../services/auth.service";

import { asyncHandler } from "../utils/async-handler";

import { RefreshTokenDto } from "../dtos/auth/refresh-token.dto";

import {
    validateRefreshTokenRequest
} from "../validators/auth/refresh-token.validator";

import { LogoutDto } from "../dtos/auth/logout.dto";

import {
    validateLogoutRequest
} from "../validators/auth/logout.validator";

export const register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const data = req.body as RegisterDto;

        const user = await registerUser(data);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });
    }
);

export const login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const data = req.body as LoginDto;

        const user = await loginUser(data);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: user
        });
    }
);

export const getCurrentUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const user = await getCurrentUserService(
            req.user!.userId
        );

        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: user
        });
    }
);

export const refresh = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const data: RefreshTokenDto = req.body;

        const validationErrors =
            validateRefreshTokenRequest(data);

        if (validationErrors.length > 0) {
            throw new AppError(
                validationErrors.join(", "),
                400
            );
        }

        const result = await refreshAccessToken(
            data.refreshToken
        );

        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: result
        });
    }
);

export const logout = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const data: LogoutDto = req.body;

        const validationErrors =
            validateLogoutRequest(data);

        if (validationErrors.length > 0) {
            throw new AppError(
                validationErrors.join(", "),
                400
            );
        }

        await logoutUser(data.refreshToken);

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    }
);