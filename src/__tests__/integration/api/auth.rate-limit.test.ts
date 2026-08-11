import request from "supertest";
import { randomUUID } from "crypto";

import app from "../../../app";
import pool from "../../../config/database";

describe(
    "Authentication rate limiting - integration",
    () => {
        const testUser = {
            email:
                `api-rate-limit-${randomUUID()}@example.com`,

            phone:
                `6${Date.now()
                    .toString()
                    .slice(-9)}`,

            password: "Password@123",

            firstName: "Rate",

            lastName: "Limit"
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
                `
                DELETE FROM users
                WHERE email = ?
                `,
                [testUser.email]
            );
        });

        it(
            "should return 429 after exceeding authentication rate limit",
            async () => {

                // -------------------------------------------------
                // Request #1
                // Register user
                // -------------------------------------------------

                const registerResponse =
                    await request(app)
                        .post(
                            "/api/v1/auth/register"
                        )
                        .send(testUser)
                        .expect(201);

                expect(
                    registerResponse.body.success
                ).toBe(true);

                // -------------------------------------------------
                // Requests #2 - #20
                // 19 login requests
                // -------------------------------------------------

                for (
                    let i = 1;
                    i <= 19;
                    i++
                ) {
                    const response =
                        await request(app)
                            .post(
                                "/api/v1/auth/login"
                            )
                            .send({
                                email:
                                    testUser.email,

                                password:
                                    "WrongPassword@123"
                            });

                    /*
                     * These requests should reach
                     * the login controller because
                     * the rate limit has not yet
                     * been exceeded.
                     */

                    expect(
                        response.status
                    ).toBe(401);

                    expect(
                        response.body.success
                    ).toBe(false);

                    expect(
                        response.body.message
                    ).toBe(
                        "Invalid email or password"
                    );
                }

                // -------------------------------------------------
                // Request #21
                // Should be rate limited
                // -------------------------------------------------

                const rateLimitedResponse =
                    await request(app)
                        .post(
                            "/api/v1/auth/login"
                        )
                        .send({
                            email:
                                testUser.email,

                            password:
                                "WrongPassword@123"
                        });

                expect(
                    rateLimitedResponse.status
                ).toBe(429);

                expect(
                    rateLimitedResponse.body
                ).toMatchObject({
                    success: false,

                    message:
                        "Too many requests. Please try again later."
                });
            },

            // bcrypt makes the 19 login requests
            // take several seconds.
            15000
        );
    }
);