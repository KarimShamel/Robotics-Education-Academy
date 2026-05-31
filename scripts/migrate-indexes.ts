import { pool } from '../lib/auth';

async function migrateIndexes() {
    console.log("Starting index migration...");
    try {
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs (category);`);
        console.log("Migration successful: Added index to blogs(category).");
    } catch (e: any) {
        console.error("Migration failed:", e);
    } finally {
        pool.end();
    }
}

migrateIndexes();
