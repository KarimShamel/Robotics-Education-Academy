import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const auth = betterAuth({
    database: pool,
    plugins: [
        admin()
    ],
    emailAndPassword: {
        enabled: true
    }
});
