import pool from "../config/database";

import {
    PoolConnection,
    ResultSetHeader
} from "mysql2/promise";

import {
    RowDataPacket
} from "mysql2";

import {
    CREATE_REFRESH_TOKEN,
    FIND_REFRESH_TOKEN_BY_HASH,
    REVOKE_REFRESH_TOKEN,
    REVOKE_REFRESH_TOKEN_BY_HASH
} from "../queries/refresh-token.queries";

interface RefreshTokenRow extends RowDataPacket {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: Date;
    revoked_at: Date | null;
}

export const createRefreshToken = async (
    id: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date
): Promise<ResultSetHeader> => {
    const [result] =
        await pool.execute<ResultSetHeader>(
            CREATE_REFRESH_TOKEN,
            [
                id,
                userId,
                tokenHash,
                expiresAt
            ]
        );

    return result;
};

export const findRefreshTokenByHash = async (
    tokenHash: string
): Promise<RefreshTokenRow[]> => {
    const [rows] =
        await pool.execute<RefreshTokenRow[]>(
            FIND_REFRESH_TOKEN_BY_HASH,
            [tokenHash]
        );

    return rows;
};

export const revokeRefreshToken = async (
    tokenId: string
): Promise<ResultSetHeader> => {
    const [result] =
        await pool.execute<ResultSetHeader>(
            REVOKE_REFRESH_TOKEN,
            [tokenId]
        );

    return result;
};

export const revokeRefreshTokenByHash = async (
    tokenHash: string
): Promise<ResultSetHeader> => {
    const [result] =
        await pool.execute<ResultSetHeader>(
            REVOKE_REFRESH_TOKEN_BY_HASH,
            [tokenHash]
        );

    return result;
};

/**
 * Atomically revokes the existing refresh token
 * and creates its replacement.
 *
 * If either operation fails, the entire transaction
 * is rolled back.
 */
export const rotateRefreshToken = async (
    oldTokenId: string,
    newTokenId: string,
    userId: string,
    newTokenHash: string,
    newExpiresAt: Date
): Promise<void> => {
    let connection: PoolConnection | undefined;

    try {
        connection = await pool.getConnection();

        await connection.beginTransaction();

        // 1. Revoke old refresh token
        const [revokeResult] =
            await connection.execute<ResultSetHeader>(
                REVOKE_REFRESH_TOKEN,
                [oldTokenId]
            );

        if (revokeResult.affectedRows === 0) {
            throw new Error(
                "Refresh token could not be revoked"
            );
        }

        // 2. Create new refresh token
        await connection.execute<ResultSetHeader>(
            CREATE_REFRESH_TOKEN,
            [
                newTokenId,
                userId,
                newTokenHash,
                newExpiresAt
            ]
        );

        // 3. Commit both operations
        await connection.commit();
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};