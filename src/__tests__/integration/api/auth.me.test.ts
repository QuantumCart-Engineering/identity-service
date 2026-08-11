import request from "supertest";
import { randomUUID } from "crypto";

import app from "../../../app";
import pool from "../../../config/database";

describe("GET /api/v1/auth/me - integration", () => {
    const testUser = {
        email: `api-me-${randomUUID()}@example.com`,
        phone: `5${Date.now().toString().slice(-9)}`,
        password: "Password@123",
        firstName: "Current",
        lastName: "User"
    };

    let accessToken: string;
    let userId: string;

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

        accessToken =
            loginResponse.body.data.accessToken;
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

    it("should return current user with a valid access token", async () => {
        const response = await request(app)
            .get("/api/v1/auth/me")
            .set(
                "Authorization",
                `Bearer ${accessToken}`
            )
            .expect(200);

        expect(response.body).toMatchObject({
            success: true,
            message: "User retrieved successfully"
        });

        expect(response.body.data).toMatchObject({
            id: userId,
            email: testUser.email,
            phone: testUser.phone,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            status: "ACTIVE"
        });

        expect(response.body.data).toHaveProperty(
            "emailVerified"
        );

        expect(response.body.data).toHaveProperty(
            "phoneVerified"
        );
    });

    it("should return 401 when authentication token is missing", async () => {
        const response = await request(app)
            .get("/api/v1/auth/me")
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: "Authentication token is required"
        });
    });

    it("should return 401 when authentication header is invalid", async () => {
        const response = await request(app)
            .get("/api/v1/auth/me")
            .set(
                "Authorization",
                "InvalidToken"
            )
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: "Invalid authentication header"
        });
    });

    it("should return 401 when access token is invalid", async () => {
        const response = await request(app)
            .get("/api/v1/auth/me")
            .set(
                "Authorization",
                "Bearer invalid-access-token"
            )
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
            message: "Invalid or expired token"
        });
    });
});