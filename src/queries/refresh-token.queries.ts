export const CREATE_REFRESH_TOKEN = `
    INSERT INTO refresh_tokens (
        id,
        user_id,
        token_hash,
        expires_at
    )
    VALUES (?, ?, ?, ?)
`;

export const FIND_REFRESH_TOKEN_BY_HASH = `
    SELECT
        id,
        user_id,
        token_hash,
        expires_at,
        revoked_at
    FROM refresh_tokens
    WHERE token_hash = ?
    LIMIT 1
`;

export const REVOKE_REFRESH_TOKEN = `
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND revoked_at IS NULL
`;

export const REVOKE_REFRESH_TOKEN_BY_HASH = `
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE token_hash = ?
      AND revoked_at IS NULL
`;