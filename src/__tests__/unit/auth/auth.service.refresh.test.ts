import { refreshAccessToken } from "../../../services/auth.service";

import { findUserById } from "../../../repositories/user.repository";

import {
    findRefreshTokenByHash,
    revokeRefreshToken,
    createRefreshToken
} from "../../../repositories/refresh-token.repository";

import {
    generateRefreshToken,
    hashRefreshToken
} from "../../../utils/refresh-token";

import { generateAccessToken } from "../../../utils/jwt";

import { getRefreshTokenExpiry } from "../../../utils/token-expiry";

jest.mock("../../../repositories/user.repository", () => ({
    findUserById: jest.fn()
}));

jest.mock(
    "../../../repositories/refresh-token.repository",
    () => ({
        findRefreshTokenByHash: jest.fn(),
        revokeRefreshToken: jest.fn(),
        createRefreshToken: jest.fn()
    })
);

jest.mock("../../../utils/refresh-token", () => ({
    generateRefreshToken: jest.fn(),
    hashRefreshToken: jest.fn()
}));

jest.mock("../../../utils/jwt", () => ({
    generateAccessToken: jest.fn()
}));

jest.mock("../../../utils/token-expiry", () => ({
    getRefreshTokenExpiry: jest.fn()
}));

const mockedFindUserById =
    findUserById as jest.Mock;

const mockedFindRefreshTokenByHash =
    findRefreshTokenByHash as jest.Mock;

const mockedRevokeRefreshToken =
    revokeRefreshToken as jest.Mock;

const mockedCreateRefreshToken =
    createRefreshToken as jest.Mock;

const mockedGenerateRefreshToken =
    generateRefreshToken as jest.Mock;

const mockedHashRefreshToken =
    hashRefreshToken as jest.Mock;

const mockedGenerateAccessToken =
    generateAccessToken as jest.Mock;

const mockedGetRefreshTokenExpiry =
    getRefreshTokenExpiry as jest.Mock;

describe("refreshAccessToken", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should reject when refresh token is missing", async () => {
        await expect(
            refreshAccessToken("")
        ).rejects.toThrow(
            "Refresh token is required"
        );

        expect(
            mockedFindRefreshTokenByHash
        ).not.toHaveBeenCalled();
    });

    it("should reject when refresh token does not exist", async () => {
        mockedHashRefreshToken.mockReturnValue(
            "unknown-token-hash"
        );

        mockedFindRefreshTokenByHash.mockResolvedValue([]);

        await expect(
            refreshAccessToken("invalid-token")
        ).rejects.toThrow(
            "Invalid refresh token"
        );

        expect(
            mockedFindRefreshTokenByHash
        ).toHaveBeenCalledWith(
            "unknown-token-hash"
        );

        expect(
            mockedFindUserById
        ).not.toHaveBeenCalled();
    });

    it("should reject when refresh token is revoked", async () => {
        mockedHashRefreshToken.mockReturnValue(
            "revoked-token-hash"
        );

        mockedFindRefreshTokenByHash.mockResolvedValue([
            {
                id: "refresh-id",
                user_id: "user-123",
                revoked_at: new Date(
                    "2026-08-10T10:00:00.000Z"
                ),
                expires_at: new Date(
                    "2026-08-17T10:00:00.000Z"
                )
            }
        ]);

        await expect(
            refreshAccessToken("revoked-token")
        ).rejects.toThrow(
            "Refresh token has been revoked"
        );

        expect(
            mockedFindUserById
        ).not.toHaveBeenCalled();

        expect(
            mockedRevokeRefreshToken
        ).not.toHaveBeenCalled();
    });

    it("should reject when refresh token is expired", async () => {
        mockedHashRefreshToken.mockReturnValue(
            "expired-token-hash"
        );

        mockedFindRefreshTokenByHash.mockResolvedValue([
            {
                id: "refresh-id",
                user_id: "user-123",
                revoked_at: null,
                expires_at: new Date(
                    "2020-01-01T00:00:00.000Z"
                )
            }
        ]);

        await expect(
            refreshAccessToken("expired-token")
        ).rejects.toThrow(
            "Refresh token has expired"
        );

        expect(
            mockedFindUserById
        ).not.toHaveBeenCalled();

        expect(
            mockedRevokeRefreshToken
        ).not.toHaveBeenCalled();
    });

    it("should reject when user does not exist", async () => {
        mockedHashRefreshToken.mockReturnValue(
            "valid-token-hash"
        );

        mockedFindRefreshTokenByHash.mockResolvedValue([
            {
                id: "refresh-id",
                user_id: "user-123",
                revoked_at: null,
                expires_at: new Date(
                    "2099-01-01T00:00:00.000Z"
                )
            }
        ]);

        mockedFindUserById.mockResolvedValue([]);

        await expect(
            refreshAccessToken("valid-token")
        ).rejects.toThrow(
            "User not found"
        );

        expect(
            mockedFindUserById
        ).toHaveBeenCalledWith("user-123");

        expect(
            mockedRevokeRefreshToken
        ).not.toHaveBeenCalled();
    });

    it("should reject when user account is inactive", async () => {
        mockedHashRefreshToken.mockReturnValue(
            "valid-token-hash"
        );

        mockedFindRefreshTokenByHash.mockResolvedValue([
            {
                id: "refresh-id",
                user_id: "user-123",
                revoked_at: null,
                expires_at: new Date(
                    "2099-01-01T00:00:00.000Z"
                )
            }
        ]);

        mockedFindUserById.mockResolvedValue([
            {
                id: "user-123",
                email: "test@example.com",
                status: "INACTIVE"
            }
        ]);

        await expect(
            refreshAccessToken("valid-token")
        ).rejects.toThrow(
            "User account is not active"
        );

        expect(
            mockedRevokeRefreshToken
        ).not.toHaveBeenCalled();

        expect(
            mockedCreateRefreshToken
        ).not.toHaveBeenCalled();
    });

    it("should refresh tokens successfully", async () => {
        const expiresAt = new Date(
            "2099-01-01T00:00:00.000Z"
        );

        mockedHashRefreshToken.mockReturnValue(
            "old-token-hash"
        );

        mockedFindRefreshTokenByHash.mockResolvedValue([
            {
                id: "old-refresh-id",
                user_id: "user-123",
                revoked_at: null,
                expires_at: expiresAt
            }
        ]);

        mockedFindUserById.mockResolvedValue([
            {
                id: "user-123",
                email: "test@example.com",
                status: "ACTIVE"
            }
        ]);

        mockedGenerateAccessToken.mockReturnValue(
            "new-access-token"
        );

        mockedGenerateRefreshToken.mockReturnValue(
            "new-refresh-token"
        );

        mockedHashRefreshToken
            .mockReturnValueOnce("old-token-hash")
            .mockReturnValueOnce("new-token-hash");

        mockedGetRefreshTokenExpiry.mockReturnValue(
            expiresAt
        );

        mockedRevokeRefreshToken.mockResolvedValue(
            undefined
        );

        mockedCreateRefreshToken.mockResolvedValue(
            undefined
        );

        const result =
            await refreshAccessToken("old-refresh-token");

        expect(result).toEqual({
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token"
        });

        expect(
            mockedRevokeRefreshToken
        ).toHaveBeenCalledWith(
            "old-refresh-id"
        );

        expect(
            mockedGenerateAccessToken
        ).toHaveBeenCalledWith({
            userId: "user-123",
            email: "test@example.com"
        });

        expect(
            mockedGenerateRefreshToken
        ).toHaveBeenCalledTimes(1);

        expect(
            mockedCreateRefreshToken
        ).toHaveBeenCalledWith(
            expect.any(String),
            "user-123",
            "new-token-hash",
            expiresAt
        );
    });

    it("should revoke the old token before storing the new token", async () => {
        const expiresAt = new Date(
            "2099-01-01T00:00:00.000Z"
        );

        mockedHashRefreshToken
            .mockReturnValueOnce("old-hash")
            .mockReturnValueOnce("new-hash");

        mockedFindRefreshTokenByHash.mockResolvedValue([
            {
                id: "old-refresh-id",
                user_id: "user-123",
                revoked_at: null,
                expires_at: expiresAt
            }
        ]);

        mockedFindUserById.mockResolvedValue([
            {
                id: "user-123",
                email: "test@example.com",
                status: "ACTIVE"
            }
        ]);

        mockedGenerateAccessToken.mockReturnValue(
            "access-token"
        );

        mockedGenerateRefreshToken.mockReturnValue(
            "new-refresh-token"
        );

        mockedGetRefreshTokenExpiry.mockReturnValue(
            expiresAt
        );

        const callOrder: string[] = [];

        mockedRevokeRefreshToken.mockImplementation(
            async () => {
                callOrder.push("revoke");
            }
        );

        mockedCreateRefreshToken.mockImplementation(
            async () => {
                callOrder.push("create");
            }
        );

        await refreshAccessToken("old-refresh-token");

        expect(callOrder).toEqual([
            "revoke",
            "create"
        ]);
    });
});