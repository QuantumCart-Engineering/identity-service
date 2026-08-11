import { randomUUID } from "crypto";

import {
    createRefreshToken,
    findRefreshTokenByHash,
    revokeRefreshToken,
    revokeRefreshTokenByHash
} from "../../../repositories/refresh-token.repository";

import {
    createUser
} from "../../../repositories/user.repository";

import pool from "../../../config/database";

describe("refresh-token.repository - integration", () => {
    const testUser = {
        id: randomUUID(),
        email: `refresh-integration-${Date.now()}@example.com`,
        phone: `8${Date.now().toString().slice(-9)}`,
        passwordHash: "hashed-password-for-test",
        firstName: "Refresh",
        lastName: "Test"
    };

    const testRefreshToken = {
        id: randomUUID(),
        tokenHash: `test-token-hash-${Date.now()}`,
        expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        )
    };

    beforeAll(async () => {
        await createUser(
            testUser.id,
            testUser.email,
            testUser.phone,
            testUser.passwordHash,
            testUser.firstName,
            testUser.lastName
        );

        await createRefreshToken(
            testRefreshToken.id,
            testUser.id,
            testRefreshToken.tokenHash,
            testRefreshToken.expiresAt
        );
    });

    afterAll(async () => {
        await pool.execute(
            "DELETE FROM refresh_tokens WHERE id = ?",
            [testRefreshToken.id]
        );

        await pool.execute(
            "DELETE FROM users WHERE id = ?",
            [testUser.id]
        );
    });

    it("should create and find a refresh token by hash", async () => {
        const tokens = await findRefreshTokenByHash(
            testRefreshToken.tokenHash
        );

        expect(tokens).toHaveLength(1);

        expect(tokens[0]).toMatchObject({
            id: testRefreshToken.id,
            user_id: testUser.id,
            token_hash: testRefreshToken.tokenHash,
            revoked_at: null
        });
    });

    it("should return an empty array when refresh token hash does not exist", async () => {
        const tokens = await findRefreshTokenByHash(
            "non-existing-refresh-token-hash"
        );

        expect(tokens).toEqual([]);
    });

    it("should revoke a refresh token by id", async () => {
        const result = await revokeRefreshToken(
            testRefreshToken.id
        );

        expect(result).toHaveProperty(
            "affectedRows",
            1
        );

        const tokens = await findRefreshTokenByHash(
            testRefreshToken.tokenHash
        );

        expect(tokens).toHaveLength(1);
        expect(tokens[0].revoked_at).not.toBeNull();
    });

    it("should revoke a refresh token by hash", async () => {
        const newTokenId = randomUUID();
        const newTokenHash = `test-token-hash-${Date.now()}-second`;

        const newExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await createRefreshToken(
            newTokenId,
            testUser.id,
            newTokenHash,
            newExpiresAt
        );

        const result = await revokeRefreshTokenByHash(
            newTokenHash
        );

        expect(result).toHaveProperty(
            "affectedRows",
            1
        );

        const tokens = await findRefreshTokenByHash(
            newTokenHash
        );

        expect(tokens).toHaveLength(1);
        expect(tokens[0].revoked_at).not.toBeNull();

        await pool.execute(
            "DELETE FROM refresh_tokens WHERE id = ?",
            [newTokenId]
        );
    });
});