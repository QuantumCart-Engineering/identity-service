import bcrypt from "bcrypt";

import { loginUser } from "../../../services/auth.service";

import { findUserForLogin } from "../../../repositories/user.repository";

import { validateLoginRequest } from "../../../validators/auth/login.validator";

import { generateAccessToken } from "../../../utils/jwt";

import {
    generateRefreshToken,
    hashRefreshToken
} from "../../../utils/refresh-token";

import { getRefreshTokenExpiry } from "../../../utils/token-expiry";

import { createRefreshToken } from "../../../repositories/refresh-token.repository";

jest.mock("bcrypt");

jest.mock("../../../repositories/user.repository", () => ({
    findUserForLogin: jest.fn()
}));

jest.mock("../../../validators/auth/login.validator", () => ({
    validateLoginRequest: jest.fn()
}));

jest.mock("../../../utils/jwt", () => ({
    generateAccessToken: jest.fn()
}));

jest.mock("../../../utils/refresh-token", () => ({
    generateRefreshToken: jest.fn(),
    hashRefreshToken: jest.fn()
}));

jest.mock("../../../utils/token-expiry", () => ({
    getRefreshTokenExpiry: jest.fn()
}));

jest.mock(
    "../../../repositories/refresh-token.repository",
    () => ({
        createRefreshToken: jest.fn()
    })
);

const mockedValidateLoginRequest =
    validateLoginRequest as jest.MockedFunction<
        typeof validateLoginRequest
    >;

const mockedFindUserForLogin =
    findUserForLogin as jest.MockedFunction<
        typeof findUserForLogin
    >;

const mockedBcryptCompare =
    bcrypt.compare as jest.Mock;

const mockedGenerateAccessToken =
    generateAccessToken as jest.MockedFunction<
        typeof generateAccessToken
    >;

const mockedGenerateRefreshToken =
    generateRefreshToken as jest.MockedFunction<
        typeof generateRefreshToken
    >;

const mockedHashRefreshToken =
    hashRefreshToken as jest.MockedFunction<
        typeof hashRefreshToken
    >;

const mockedGetRefreshTokenExpiry =
    getRefreshTokenExpiry as jest.MockedFunction<
        typeof getRefreshTokenExpiry
    >;

const mockedCreateRefreshToken =
    createRefreshToken as jest.MockedFunction<
        typeof createRefreshToken
    >;

describe("loginUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should successfully login an active user", async () => {
        const data = {
            email: " Test@Example.com ",
            password: "Password@123"
        };

        const user = {
            id: "user-123",
            email: "test@example.com",
            phone: "9876543210",
            password_hash: "hashed-password",
            first_name: "Test",
            last_name: "User",
            status: "ACTIVE"
        };

        const expiresAt = new Date(
            "2026-08-17T15:59:54.000Z"
        );

        mockedValidateLoginRequest.mockReturnValue([]);

        mockedFindUserForLogin.mockResolvedValue([
            user
        ] as any);

        mockedBcryptCompare.mockResolvedValue(true);

        mockedGenerateAccessToken.mockReturnValue(
            "access-token"
        );

        mockedGenerateRefreshToken.mockReturnValue(
            "refresh-token"
        );

        mockedHashRefreshToken.mockReturnValue(
            "refresh-token-hash"
        );

        mockedGetRefreshTokenExpiry.mockReturnValue(
            expiresAt
        );

        mockedCreateRefreshToken.mockResolvedValue(
            undefined as never
        );

        const result = await loginUser(data);

        expect(result).toEqual({
            accessToken: "access-token",
            refreshToken: "refresh-token",
            user: {
                id: "user-123",
                email: "test@example.com",
                phone: "9876543210",
                firstName: "Test",
                lastName: "User"
            }
        });

        expect(mockedFindUserForLogin)
            .toHaveBeenCalledWith(
                "test@example.com"
            );

        expect(mockedBcryptCompare)
            .toHaveBeenCalledWith(
                "Password@123",
                "hashed-password"
            );

        expect(mockedGenerateAccessToken)
            .toHaveBeenCalledWith({
                userId: "user-123",
                email: "test@example.com"
            });

        expect(mockedGenerateRefreshToken)
            .toHaveBeenCalledTimes(1);

        expect(mockedHashRefreshToken)
            .toHaveBeenCalledWith(
                "refresh-token"
            );

        expect(mockedCreateRefreshToken)
            .toHaveBeenCalledWith(
                expect.any(String),
                "user-123",
                "refresh-token-hash",
                expiresAt
            );
    });

    it("should reject login when validation fails", async () => {
        const data = {
            email: "",
            password: ""
        };

        mockedValidateLoginRequest.mockReturnValue([
            "Email is required",
            "Password is required"
        ]);

        await expect(
            loginUser(data)
        ).rejects.toThrow(
            "Email is required, Password is required"
        );

        expect(
            mockedFindUserForLogin
        ).not.toHaveBeenCalled();

        expect(
            mockedBcryptCompare
        ).not.toHaveBeenCalled();

        expect(
            mockedCreateRefreshToken
        ).not.toHaveBeenCalled();
    });

    it("should reject login when user does not exist", async () => {
        const data = {
            email: "unknown@example.com",
            password: "Password@123"
        };

        mockedValidateLoginRequest.mockReturnValue([]);

        mockedFindUserForLogin.mockResolvedValue([]);

        await expect(
            loginUser(data)
        ).rejects.toThrow(
            "Invalid email or password"
        );

        expect(
            mockedBcryptCompare
        ).not.toHaveBeenCalled();

        expect(
            mockedGenerateAccessToken
        ).not.toHaveBeenCalled();

        expect(
            mockedCreateRefreshToken
        ).not.toHaveBeenCalled();
    });

    it("should reject login when user account is inactive", async () => {
        const data = {
            email: "test@example.com",
            password: "Password@123"
        };

        const inactiveUser = {
            id: "user-123",
            email: "test@example.com",
            phone: "9876543210",
            password_hash: "hashed-password",
            first_name: "Test",
            last_name: "User",
            status: "INACTIVE"
        };

        mockedValidateLoginRequest.mockReturnValue([]);

        mockedFindUserForLogin.mockResolvedValue([
            inactiveUser
        ] as any);

        await expect(
            loginUser(data)
        ).rejects.toThrow(
            "User account is not active"
        );

        expect(
            mockedBcryptCompare
        ).not.toHaveBeenCalled();

        expect(
            mockedGenerateAccessToken
        ).not.toHaveBeenCalled();

        expect(
            mockedCreateRefreshToken
        ).not.toHaveBeenCalled();
    });

    it("should reject login when password is incorrect", async () => {
        const data = {
            email: "test@example.com",
            password: "WrongPassword123"
        };

        const user = {
            id: "user-123",
            email: "test@example.com",
            phone: "9876543210",
            password_hash: "hashed-password",
            first_name: "Test",
            last_name: "User",
            status: "ACTIVE"
        };

        mockedValidateLoginRequest.mockReturnValue([]);

        mockedFindUserForLogin.mockResolvedValue([
            user
        ] as any);

        mockedBcryptCompare.mockResolvedValue(false);

        await expect(
            loginUser(data)
        ).rejects.toThrow(
            "Invalid email or password"
        );

        expect(
            mockedGenerateAccessToken
        ).not.toHaveBeenCalled();

        expect(
            mockedGenerateRefreshToken
        ).not.toHaveBeenCalled();

        expect(
            mockedCreateRefreshToken
        ).not.toHaveBeenCalled();
    });

    it("should store the refresh token after successful password verification", async () => {
        const data = {
            email: "test@example.com",
            password: "Password@123"
        };

        const user = {
            id: "user-456",
            email: "test@example.com",
            phone: "9876543210",
            password_hash: "hashed-password",
            first_name: "Test",
            last_name: "User",
            status: "ACTIVE"
        };

        const expiresAt = new Date(
            "2026-08-17T15:59:54.000Z"
        );

        mockedValidateLoginRequest.mockReturnValue([]);

        mockedFindUserForLogin.mockResolvedValue([
            user
        ] as any);

        mockedBcryptCompare.mockResolvedValue(true);

        mockedGenerateAccessToken.mockReturnValue(
            "access-token-456"
        );

        mockedGenerateRefreshToken.mockReturnValue(
            "refresh-token-456"
        );

        mockedHashRefreshToken.mockReturnValue(
            "hash-456"
        );

        mockedGetRefreshTokenExpiry.mockReturnValue(
            expiresAt
        );

        mockedCreateRefreshToken.mockResolvedValue(
            undefined as never
        );

        await loginUser(data);

        expect(
            mockedCreateRefreshToken
        ).toHaveBeenCalledTimes(1);

        expect(
            mockedCreateRefreshToken
        ).toHaveBeenCalledWith(
            expect.any(String),
            "user-456",
            "hash-456",
            expiresAt
        );
    });
});