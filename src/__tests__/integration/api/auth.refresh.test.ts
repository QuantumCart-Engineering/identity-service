import request from "supertest";
import { randomUUID } from "crypto";

import app from "../../../app";
import pool from "../../../config/database";

describe("POST /api/v1/auth/refresh - integration", () => {
    const testUser = {
        email: `api-refresh-${randomUUID()}@example.com`,
        phone: `4${Date.now().toString().slice(-9)}`,
        password: "Password@123",
        firstName: "Refresh",
        lastName: "Test"
    };

    let userId: string;
    let refreshToken: string;
    let newRefreshToken: string;

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

    it("should refresh access token successfully", async () => {
        const response = await request(app)
            .post("/api/v1/auth/refresh")
            .send({
                refreshToken
            })
            .expect(200);

        expect(response.body).toMatchObject({
            success: true,
            message: "Access token refreshed successfully"
        });

        expect(response.body.data.accessToken)
            .toBeDefined();

        expect(response.body.data.refreshToken)
            .toBeDefined();

        expect(response.body.data.refreshToken)
            .not.toBe(refreshToken);

        newRefreshToken =
            response.body.data.refreshToken;
    });

    it("should reject the old refresh token after rotation", async () => {
        const response = await request(app)
            .post("/api/v1/auth/refresh")
            .send({
                refreshToken
            })
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: "Refresh token has been revoked"
        });
    });

    it("should reject an invalid refresh token", async () => {
        const response = await request(app)
            .post("/api/v1/auth/refresh")
            .send({
                refreshToken: "this-is-not-a-real-refresh-token"
            })
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: "Invalid refresh token"
        });
    });

    it("should return 400 when refresh token is missing", async () => {
        const response = await request(app)
            .post("/api/v1/auth/refresh")
            .send({})
            .expect(400);

        expect(response.body).toMatchObject({
            success: false,
            message: "Refresh token is required"
        });
    });

    it("should reject a refresh token that has already been rotated", async () => {
        const response = await request(app)
            .post("/api/v1/auth/refresh")
            .send({
                refreshToken
            })
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: "Refresh token has been revoked"
        });
    });
});