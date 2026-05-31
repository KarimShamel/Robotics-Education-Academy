import { pool } from './lib/auth';

async function inspect() {
    try {
        const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        console.log("Tables:", res.rows.map(r => r.table_name));

        const blogsRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'blogs'
        `);
        console.log("Blogs columns:", blogsRes.rows);

        const indexRes = await pool.query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'blogs'
        `);
        console.log("Blogs indexes:", indexRes.rows);
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
inspect();
