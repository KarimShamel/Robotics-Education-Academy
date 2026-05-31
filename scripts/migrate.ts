import { pool } from '../lib/auth';

async function migrate() {
    console.log("Starting migration...");
    try {
        await pool.query(`ALTER TABLE blogs ADD COLUMN images JSONB DEFAULT '[]'::jsonb;`);
        console.log("Migration successful: Added images column.");
    } catch (e) {
        if (e.message.includes('already exists')) {
            console.log("Column already exists.");
        } else {
            console.error("Migration failed:", e);
        }
    } finally {
        pool.end();
    }
}

migrate();
