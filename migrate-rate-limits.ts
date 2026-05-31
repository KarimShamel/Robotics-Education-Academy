import { pool } from './lib/auth';

async function migrateRateLimits() {
    console.log("Starting rate_limits table migration...");
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rate_limits (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        // Add an index to speed up the rate limit check query
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action_time 
            ON rate_limits (user_id, action, created_at);
        `);
        console.log("Migration successful: Created rate_limits table and index.");
    } catch (e: any) {
        console.error("Migration failed:", e);
    } finally {
        pool.end();
    }
}

migrateRateLimits();
