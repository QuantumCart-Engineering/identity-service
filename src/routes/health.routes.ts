import { Router } from "express";
import { getHealth } from "../controllers/health.controller";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check service health
 *     description: Returns the current health status of the Identity Service.
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get(
    "/health",
    getHealth
);

export default router;