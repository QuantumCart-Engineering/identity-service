import request from "supertest";
import { randomUUID } from "crypto";

import app from "../../../app";
import pool from "../../../config/database";

describe("POST /api/v1/auth/login - integration", () => {
    const testUser = {
        email: `api-login-${randomUUID()}@example.com`,
        phone: `6${Date.now().toString().slice(-9)}`,
        password: "Password@123",
        firstName: "Login",
        lastName: "Test"
    };

    afterAll(async () => {
        await pool.execute(
            `
            DELETE FROM refresh_tokens
            WHERE user_id = (
                SELECT id
                FROM users
                WHERE email = ?
            )
            `,
            [testUser.email]
        );

        await pool.execute(
            "DELETE FROM users WHERE email = ?",
            [testUser.email]
        );
    });

    it("should login successfully with valid credentials", async () => {
        // Create test user through the real registration API
        const registerResponse = await request(app)
            .post("/api/v1/auth/register")
            .send(testUser)
            .expect(201);

        expect(registerResponse.body.success).toBe(true);

        // Login through the real API
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            })
            .expect(200);

        expect(response.body).toMatchObject({
            success: true,
            message: "Login successful"
        });

        expect(response.body.data).toHaveProperty(
            "accessToken"
        );

        expect(response.body.data).toHaveProperty(
            "refreshToken"
        );

        expect(response.body.data.user).toMatchObject({
            email: testUser.email,
            phone: testUser.phone,
            firstName: testUser.firstName,
            lastName: testUser.lastName
        });

        expect(response.body.data.user.id).toBe(
            registerResponse.body.data.id
        );
    });

    it("should return 401 for incorrect password", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: "WrongPassword@123"
            })
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: "Invalid email or password"
        });
    });

    it("should return 401 when user does not exist", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: `non-existing-${randomUUID()}@example.com`,
                password: "Password@123"
            })
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: "Invalid email or password"
        });
    });

    it("should return 400 when login data is invalid", async () => {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "",
                password: ""
            })
            .expect(400);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toContain(
            "Email is required"
        );

        expect(response.body.message).toContain(
            "Password is required"
        );
    });
});