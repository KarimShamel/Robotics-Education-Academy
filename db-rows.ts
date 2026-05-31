import { pool } from './lib/auth';

async function checkRows() {
    try {
        const res = await pool.query('SELECT id, title, category, subtitle FROM blogs ORDER BY created_at DESC');
        console.log("Blogs total count:", res.rowCount);
        console.log("Blogs items:", res.rows);
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
checkRows();
