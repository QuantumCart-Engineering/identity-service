import pool from "../config/database";

import { RowDataPacket, ResultSetHeader } from "mysql2";

import {
    CREATE_REFRESH_TOKEN, FIND_REFRESH_TOKEN_BY_HASH, REVOKE_REFRESH_TOKEN,
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
    const [result] = await pool.execute<ResultSetHeader>(
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
    const [rows] = await pool.execute<RefreshTokenRow[]>(
        FIND_REFRESH_TOKEN_BY_HASH,
        [tokenHash]
    );

    return rows;
};

export const revokeRefreshToken = async (
    tokenId: string
): Promise<ResultSetHeader> => {
    const [result] = await pool.execute<ResultSetHeader>(
        REVOKE_REFRESH_TOKEN,
        [tokenId]
    );

    return result;
};

export const revokeRefreshTokenByHash = async (
    tokenHash: string
): Promise<ResultSetHeader> => {
    const [result] = await pool.execute<ResultSetHeader>(
        REVOKE_REFRESH_TOKEN_BY_HASH,
        [tokenHash]
    );

    return result;
};