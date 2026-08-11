import dotenv from "dotenv";
import app from "./app";
import pool from "./config/database";

dotenv.config();

const PORT = Number(process.env.PORT) || 8001;

const startServer = async (): Promise<void> => {
    try {
        await pool.query("SELECT 1");

        console.log("✅ Connected to MySQL Database");

        app.listen(PORT, () => {
            console.log(`🚀 Identity Service is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to connect to MySQL Database");
        console.error(error);

        process.exit(1);
    }
};

startServer();