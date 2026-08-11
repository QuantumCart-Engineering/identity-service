import request from "supertest";
import { randomUUID } from "crypto";

import app from "../../../app";
import pool from "../../../config/database";

describe("POST /api/v1/auth/logout - integration", () => {
    const testUser = {
        email: `api-logout-${randomUUID()}@example.com`,
        phone: `3${Date.now().toString().slice(-9)}`,
        password: "Password@123",
        firstName: "Logout",
        lastName: "Test"
    };

    let userId: string;
    let refreshToken: string;

    beforeAll(async () => {
        const registerResponse = await request(app)
            .post("/api/v1/auth/register")
            .send(testUser)
            .expect(201);

        userId = registerResponse.body.data.id;

        const loginResponse = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            })
            .expect(200);

        refreshToken =
            loginResponse.body.data.refreshToken;
    });

    afterAll(async () => {
        await pool.execute(
            "DELETE FROM refresh_tokens WHERE user_id = ?",
            [userId]
        );

        await pool.execute(
            "DELETE FROM users WHERE id = ?",
            [userId]
        );
    });

    it("should logout successfully with a valid refresh token", async () => {
        const response = await request(app)
            .post("/api/v1/auth/logout")
            .send({
                refreshToken
            })
            .expect(200);

        expect(response.body).toMatchObject({
            success: true,
            message: "Logout successful"
        });
    });

    it("should reject the same refresh token after logout", async () => {
        const response = await request(app)
            .post("/api/v1/auth/logout")
            .send({
                refreshToken
            })
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: "Invalid or already revoked refresh token"
        });
    });

    it("should reject an invalid refresh token", async () => {
        const response = await request(app)
            .post("/api/v1/auth/logout")
            .send({
                refreshToken: "this-is-not-a-real-refresh-token"
            })
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: "Invalid or already revoked refresh token"
        });
    });

    it("should return 400 when refresh token is missing", async () => {
        const response = await request(app)
            .post("/api/v1/auth/logout")
            .send({})
            .expect(400);

        expect(response.body).toMatchObject({
            success: false,
            message: "Refresh token is required"
        });
    });
});