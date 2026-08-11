import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/auth.routes";
import healthRoutes from "./routes/health.routes";

import { errorMiddleware } from "./middlewares/error.middleware";

import { swaggerSpec } from "./config/swagger";

const app: Application = express();

// --------------------------------------------------
// Security & General Middlewares
// --------------------------------------------------

app.use(helmet());

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// --------------------------------------------------
// API Documentation
// --------------------------------------------------

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use(
    "/",
    healthRoutes
);

app.use(
    "/api/v1/auth",
    authRoutes
);

// --------------------------------------------------
// Error Middleware
// Must be registered after all routes
// --------------------------------------------------

app.use(errorMiddleware);

export default app;