import request from "supertest";

import app from "../../../app";

describe("Health API - integration", () => {
    it("should return healthy status", async () => {
        const response = await request(app)
            .get("/health")
            .expect(200);

        expect(response.body).toHaveProperty(
            "success",
            true
        );
    });
});