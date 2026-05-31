import { pool } from '../lib/auth';

async function up() {
    try {
        console.log("Creating index on created_at DESC...");
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_blogs_created_at 
            ON blogs (created_at DESC);
        `);
        console.log("Index created successfully.");
    } catch(e) {
        console.error("Migration failed:", e);
    } finally {
        pool.end();
    }
}
up();
