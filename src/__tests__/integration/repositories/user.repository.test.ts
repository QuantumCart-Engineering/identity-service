import { randomUUID } from "crypto";

import {
    createUser,
    findUserByEmail,
    findUserByPhone,
    findUserForLogin,
    findUserById
} from "../../../repositories/user.repository";

import pool from "../../../config/database";

describe("user.repository - integration", () => {
    const testUser = {
        id: randomUUID(),
        email: `integration-${Date.now()}@example.com`,
        phone: `9${Date.now().toString().slice(-9)}`,
        passwordHash: "hashed-password-for-test",
        firstName: "Integration",
        lastName: "Test"
    };

    afterAll(async () => {
        await pool.execute(
            "DELETE FROM users WHERE id = ?",
            [testUser.id]
        );

    });

    it("should create a user successfully", async () => {
        await createUser(
            testUser.id,
            testUser.email,
            testUser.phone,
            testUser.passwordHash,
            testUser.firstName,
            testUser.lastName
        );

        const users = await findUserByEmail(
            testUser.email
        );

        expect(users).toHaveLength(1);

        expect(users[0].id).toBe(testUser.id);
    });

    it("should return an empty array when email does not exist", async () => {
        const users = await findUserByEmail(
            "non-existing-user@example.com"
        );

        expect(users).toEqual([]);
    });

    it("should find a user by phone", async () => {
        const users = await findUserByPhone(
            testUser.phone
        );

        expect(users).toHaveLength(1);
        expect(users[0].id).toBe(testUser.id);
    });

    it("should return an empty array when phone does not exist", async () => {
        const users = await findUserByPhone(
            "9000000000"
        );

        expect(users).toEqual([]);
    });

    it("should find a user for login with password hash", async () => {
        const users = await findUserForLogin(
            testUser.email
        );

        expect(users).toHaveLength(1);

        expect(users[0]).toMatchObject({
            id: testUser.id,
            email: testUser.email,
            phone: testUser.phone,
            password_hash: testUser.passwordHash,
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            status: "ACTIVE",
            email_verified: 0,
            phone_verified: 0
        });
    });

    it("should find a user by id", async () => {
        const users = await findUserById(
            testUser.id
        );

        expect(users).toHaveLength(1);

        expect(users[0]).toMatchObject({
            id: testUser.id,
            email: testUser.email,
            phone: testUser.phone,
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            status: "ACTIVE",
            email_verified: 0,
            phone_verified: 0
        });
    });

    it("should return an empty array when user id does not exist", async () => {
        const users = await findUserById(
            randomUUID()
        );

        expect(users).toEqual([]);
    });
});