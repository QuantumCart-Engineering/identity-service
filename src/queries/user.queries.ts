export const FIND_USER_BY_EMAIL = `
    SELECT id
    FROM users
    WHERE email = ?
    LIMIT 1
`;

export const FIND_USER_BY_PHONE = `
    SELECT id
    FROM users
    WHERE phone = ?
    LIMIT 1
`;

export const CREATE_USER = `
    INSERT INTO users
    (id, email, phone, password_hash, first_name, last_name)
    VALUES (?, ?, ?, ?, ?, ?)
`;

export const FIND_USER_FOR_LOGIN = `
    SELECT
        id,
        email,
        phone,
        password_hash,
        first_name,
        last_name,
        status,
        email_verified,
        phone_verified
    FROM users
    WHERE email = ?
    LIMIT 1
`;

export const FIND_USER_BY_ID = `
    SELECT
        id,
        email,
        phone,
        first_name,
        last_name,
        status,
        email_verified,
        phone_verified,
        created_at,
        updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
`;