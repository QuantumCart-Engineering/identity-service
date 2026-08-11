import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import { RegisterDto } from "../dtos/auth/register.dto";
import { LoginDto } from "../dtos/auth/login.dto";

import {
    validateRegisterRequest
} from "../validators/auth/register.validator";

import {
    validateLoginRequest
} from "../validators/auth/login.validator";

import {
    findUserByEmail,
    findUserByPhone,
    createUser,
    findUserForLogin,
    findUserById,
} from "../repositories/user.repository";

import { AppError } from "../utils/app-error";

import { generateAccessToken } from "../utils/jwt";
import {
    generateRefreshToken,
    hashRefreshToken
} from "../utils/refresh-token";
import { getRefreshTokenExpiry } from "../utils/token-expiry";
import {
    createRefreshToken, findRefreshTokenByHash, revokeRefreshToken, revokeRefreshTokenByHash
} from "../repositories/refresh-token.repository";


export const registerUser = async (data: RegisterDto) => {
    // 1. Validate request
    const validationErrors = validateRegisterRequest(data);

    if (validationErrors.length > 0) {
        throw new AppError(
            validationErrors.join(", "),
            400
        );
    }

    // 2. Normalize user input
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim();
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();

    // 3. Check duplicate email
    const existingEmail = await findUserByEmail(email);

    if (Array.isArray(existingEmail) && existingEmail.length > 0) {
        throw new AppError(
            "Email is already registered",
            409
        );
    }

    // 4. Check duplicate phone
    const existingPhone = await findUserByPhone(phone);

    if (Array.isArray(existingPhone) && existingPhone.length > 0) {
        throw new AppError(
            "Phone is already registered",
            409
        );
    }

    // 5. Generate UUID
    const userId = randomUUID();

    // 6. Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // 7. Create user
    await createUser(
        userId,
        email,
        phone,
        passwordHash,
        firstName,
        lastName
    );

    // 8. Return safe user data
    return {
        id: userId,
        email,
        phone,
        firstName,
        lastName
    };
};

export const loginUser = async (data: LoginDto) => {
    // 1. Validate request
    const validationErrors = validateLoginRequest(data);

    if (validationErrors.length > 0) {
        throw new AppError(
            validationErrors.join(", "),
            400
        );
    }

    // 2. Normalize email
    const email = data.email.trim().toLowerCase();

    // 3. Find user
    const users = await findUserForLogin(email);

    if (!Array.isArray(users) || users.length === 0) {
        throw new AppError(
            "Invalid email or password",
            401
        );
    }

    const user = users[0];

    // 4. Check account status
    if (user.status !== "ACTIVE") {
        throw new AppError(
            "User account is not active",
            403
        );
    }

    // 5. Compare password
    const passwordMatches = await bcrypt.compare(
        data.password,
        user.password_hash
    );

    if (!passwordMatches) {
        throw new AppError(
            "Invalid email or password",
            401
        );
    }

    // 6. Generate access token
    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email
    });

    // 7. Generate refresh token and store it in the database
    const refreshToken = generateRefreshToken();

    const refreshTokenHash = hashRefreshToken(
        refreshToken
    );

    const refreshTokenId = randomUUID();

    const refreshTokenExpiresAt =
        getRefreshTokenExpiry();

    await createRefreshToken(
        refreshTokenId,
        user.id,
        refreshTokenHash,
        refreshTokenExpiresAt
    );

    // 8. Return safe user data
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.first_name,
            lastName: user.last_name
        }
    };
};

export const getCurrentUser = async (userId: string) => {
    const users = await findUserById(userId);

    if (users.length === 0) {
        throw new AppError(
            "User not found",
            404
        );
    }

    const user = users[0];

    if (user.status !== "ACTIVE") {
        throw new AppError(
            "User account is not active",
            403
        );
    }

    return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        status: user.status,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at
    };
};

export const refreshAccessToken = async (
    refreshToken: string
) => {
    if (!refreshToken) {
        throw new AppError(
            "Refresh token is required",
            400
        );
    }

    // 1. Hash incoming refresh token
    const tokenHash = hashRefreshToken(
        refreshToken
    );

    // 2. Find token in database
    const tokens = await findRefreshTokenByHash(
        tokenHash
    );

    if (tokens.length === 0) {
        throw new AppError(
            "Invalid refresh token",
            401
        );
    }

    const tokenRecord = tokens[0];

    // 3. Check revoked
    if (tokenRecord.revoked_at !== null) {
        throw new AppError(
            "Refresh token has been revoked",
            401
        );
    }

    // 4. Check expiry
    if (
        new Date() >=
        new Date(tokenRecord.expires_at)
    ) {
        throw new AppError(
            "Refresh token has expired",
            401
        );
    }

    // 5. Find user
    const users = await findUserById(
        tokenRecord.user_id
    );

    if (users.length === 0) {
        throw new AppError(
            "User not found",
            404
        );
    }

    const user = users[0];

    // 6. Check account status
    if (user.status !== "ACTIVE") {
        throw new AppError(
            "User account is not active",
            403
        );
    }

    // 7. Revoke old refresh token
    await revokeRefreshToken(
        tokenRecord.id
    );

    // 8. Generate new access token
    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email
    });

    // 9. Generate new refresh token
    const newRefreshToken =
        generateRefreshToken();

    const newRefreshTokenHash =
        hashRefreshToken(newRefreshToken);

    const newRefreshTokenId =
        randomUUID();

    const newRefreshTokenExpiresAt =
        getRefreshTokenExpiry();

    // 10. Save new refresh token
    await createRefreshToken(
        newRefreshTokenId,
        user.id,
        newRefreshTokenHash,
        newRefreshTokenExpiresAt
    );

    return {
        accessToken,
        refreshToken: newRefreshToken
    };
};

export const logoutUser = async (
    refreshToken: string
): Promise<void> => {
    if (!refreshToken) {
        throw new AppError(
            "Refresh token is required",
            400
        );
    }

    const tokenHash = hashRefreshToken(
        refreshToken
    );

    const result = await revokeRefreshTokenByHash(
        tokenHash
    );

    if (result.affectedRows === 0) {
        throw new AppError(
            "Invalid or already revoked refresh token",
            401
        );
    }
};