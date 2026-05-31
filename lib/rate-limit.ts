import { pool } from "./auth.js";

export const uploadRateLimit = {
    limit: async (userId: string) => {
        const timeAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        try {
            const result = await pool.query(
                'SELECT COUNT(*) FROM rate_limits WHERE user_id = $1 AND action = $2 AND created_at > $3',
                [userId, 'upload', timeAgo]
            );
            
            const count = parseInt(result.rows[0].count) || 0;
            
            if (count >= 10) {
                return { success: false };
            }
            
            await pool.query(
                'INSERT INTO rate_limits (user_id, action) VALUES ($1, $2)',
                [userId, 'upload']
            );
            
            return { success: true };
        } catch (err) {
            console.error("Rate limit check error:", err);
            return { success: true }; // Fail open if DB fails
        }
    }
};
