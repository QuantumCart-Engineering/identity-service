import { logoutUser } from "../../../services/auth.service";

import {
    revokeRefreshTokenByHash
} from "../../../repositories/refresh-token.repository";

import {
    hashRefreshToken
} from "../../../utils/refresh-token";

jest.mock(
    "../../../repositories/refresh-token.repository",
    () => ({
        revokeRefreshTokenByHash: jest.fn()
    })
);

jest.mock("../../../utils/refresh-token", () => ({
    hashRefreshToken: jest.fn()
}));

const mockedRevokeRefreshTokenByHash =
    revokeRefreshTokenByHash as jest.Mock;

const mockedHashRefreshToken =
    hashRefreshToken as jest.Mock;

describe("logoutUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should reject when refresh token is missing", async () => {
        await expect(
            logoutUser("")
        ).rejects.toThrow(
            "Refresh token is required"
        );

        expect(
            mockedHashRefreshToken
        ).not.toHaveBeenCalled();

        expect(
            mockedRevokeRefreshTokenByHash
        ).not.toHaveBeenCalled();
    });

    it("should reject when refresh token is invalid or already revoked", async () => {
        mockedHashRefreshToken.mockReturnValue(
            "invalid-token-hash"
        );

        mockedRevokeRefreshTokenByHash.mockResolvedValue({
            affectedRows: 0
        });

        await expect(
            logoutUser("invalid-refresh-token")
        ).rejects.toThrow(
            "Invalid or already revoked refresh token"
        );

        expect(
            mockedHashRefreshToken
        ).toHaveBeenCalledWith(
            "invalid-refresh-token"
        );

        expect(
            mockedRevokeRefreshTokenByHash
        ).toHaveBeenCalledWith(
            "invalid-token-hash"
        );
    });

    it("should successfully logout and revoke the refresh token", async () => {
        mockedHashRefreshToken.mockReturnValue(
            "valid-token-hash"
        );

        mockedRevokeRefreshTokenByHash.mockResolvedValue({
            affectedRows: 1
        });

        await expect(
            logoutUser("valid-refresh-token")
        ).resolves.toBeUndefined();

        expect(
            mockedHashRefreshToken
        ).toHaveBeenCalledWith(
            "valid-refresh-token"
        );

        expect(
            mockedRevokeRefreshTokenByHash
        ).toHaveBeenCalledWith(
            "valid-token-hash"
        );
    });
});