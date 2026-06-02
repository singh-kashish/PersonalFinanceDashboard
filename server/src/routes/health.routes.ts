import express from "express";

import healthController from "../controllers/health.controller";

const router = express.Router();
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/health',healthController)

export default router