import pool from "../config/database";

import {
    FIND_USER_BY_EMAIL,
    FIND_USER_BY_PHONE,
    CREATE_USER,
    FIND_USER_FOR_LOGIN,
    FIND_USER_BY_ID
} from "../queries/user.queries";

import { RowDataPacket, ResultSetHeader } from "mysql2";

interface UserRow extends RowDataPacket {
    id: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    status: "ACTIVE" | "INACTIVE" | "BLOCKED";
    email_verified: boolean;
    phone_verified: boolean;
    created_at?: Date;
    updated_at?: Date;
}

interface LoginUserRow extends UserRow {
    password_hash: string;
}

export const findUserByEmail = async (
    email: string
): Promise<RowDataPacket[]> => {
    const [rows] = await pool.execute<RowDataPacket[]>(
        FIND_USER_BY_EMAIL,
        [email]
    );

    return rows;
};

export const findUserByPhone = async (
    phone: string
): Promise<RowDataPacket[]> => {
    const [rows] = await pool.execute<RowDataPacket[]>(
        FIND_USER_BY_PHONE,
        [phone]
    );

    return rows;
};

export const createUser = async (
    id: string,
    email: string,
    phone: string,
    passwordHash: string,
    firstName: string,
    lastName: string
): Promise<ResultSetHeader> => {
    const [result] = await pool.execute<ResultSetHeader>(
        CREATE_USER,
        [
            id,
            email,
            phone,
            passwordHash,
            firstName,
            lastName
        ]
    );

    return result;
};

export const findUserForLogin = async (
    email: string
): Promise<LoginUserRow[]> => {
    const [rows] = await pool.execute<LoginUserRow[]>(
        FIND_USER_FOR_LOGIN,
        [email]
    );

    return rows;
};

export const findUserById = async (
    userId: string
): Promise<UserRow[]> => {
    const [rows] = await pool.execute<UserRow[]>(
        FIND_USER_BY_ID,
        [userId]
    );

    return rows;
};