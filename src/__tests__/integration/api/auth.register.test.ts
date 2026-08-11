import request from "supertest";
import { randomUUID } from "crypto";

import app from "../../../app";
import pool from "../../../config/database";

describe("POST /api/v1/auth/register - integration", () => {
    const testUser = {
        email: `api-register-${randomUUID()}@example.com`,
        phone: `7${Date.now().toString().slice(-9)}`,
        password: "Password@123",
        firstName: "API",
        lastName: "Test"
    };

    afterAll(async () => {
        await pool.execute(
            "DELETE FROM users WHERE email = ?",
            [testUser.email]
        );
    });

    it("should register a new user successfully", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(testUser)
            .expect(201);

        expect(response.body).toMatchObject({
            success: true,
            message: "User registered successfully"
        });

        expect(response.body.data).toMatchObject({
            email: testUser.email,
            phone: testUser.phone,
            firstName: testUser.firstName,
            lastName: testUser.lastName
        });

        expect(response.body.data.id).toBeDefined();
    });

    it("should return 409 when email is already registered", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(testUser)
            .expect(409);

        expect(response.body).toMatchObject({
            success: false,
            message: "Email is already registered"
        });
    });

    it("should return 400 when registration data is invalid", async () => {
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send({
                email: "invalid-email",
                phone: "12345",
                password: "123",
                firstName: "API",
                lastName: "Test"
            })
            .expect(400);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toContain(
            "Invalid email format"
        );

        expect(response.body.message).toContain(
            "Phone must contain exactly 10 digits"
        );

        expect(response.body.message).toContain(
            "Password must be at least 8 characters long"
        );
    });
});