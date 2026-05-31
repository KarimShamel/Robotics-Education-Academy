import { auth, pool } from "../../lib/auth";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const postSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    image_url: z.string().optional().nullable(),
    images: z.array(z.string()).optional(),
    is_featured: z.boolean().optional(),
    category: z.string().optional(),
    subtitle: z.string().optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === "GET") {
            const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 3, 1), 50);
            const page = Math.max(parseInt(req.query.page as string) || 1, 1);
            const offset = (page - 1) * limit;

            try {
                // Fetch limit + 1 to determine if there is a next page without a COUNT(*) query
                const queryLimit = limit + 1;
                const category = req.query.category as string;
                let categoryFilter = '';
                let queryParams: any[] = [queryLimit, offset];
                if (category && category !== 'ALL') {
                    categoryFilter = 'WHERE category = $3';
                    queryParams.push(category);
                }

                const result = await pool.query(
                    `SELECT b.id, b.title, LEFT(b.content, 300) as content, b.image_url, b.category, b.subtitle, b.is_featured, b.created_at, b.updated_at 
                     FROM (
                         SELECT id, created_at FROM blogs 
                         ${categoryFilter}
                         ORDER BY created_at DESC 
                         LIMIT $1 OFFSET $2
                     ) as t
                     JOIN blogs b ON b.id = t.id
                     ORDER BY b.created_at DESC`,
                    queryParams
                );

                const hasNextPage = result.rows.length > limit;
                const data = hasNextPage ? result.rows.slice(0, limit) : result.rows;

                // Also calculate total achievements count in this category
                let totalCountQuery = 'SELECT COUNT(*) FROM blogs';
                let totalCountParams: any[] = [];
                if (category && category !== 'ALL') {
                    totalCountQuery = 'SELECT COUNT(*) FROM blogs WHERE category = $1';
                    totalCountParams.push(category);
                }
                const countResult = await pool.query(totalCountQuery, totalCountParams);
                const total = parseInt(countResult.rows[0].count) || 0;

                return res.status(200).json({
                    data,
                    meta: { 
                        current_page: page, 
                        has_next_page: hasNextPage,
                        has_prev_page: page > 1,
                        total
                    }
                });
            } catch (err: any) {
                console.error('Database Error:', err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        } else if (req.method === "POST") {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session || session.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden" });
            }

            const parseResult = postSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: "Invalid input format", details: parseResult.error.format() });
            }

            const { title, content, image_url, images, is_featured, category, subtitle } = parseResult.data;

            const cleanContent = sanitizeHtml(content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'u', 's', 'span']),
                allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    img: ['src', 'alt', 'width', 'height'],
                    '*': ['style', 'class']
                }
            });

            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                if (is_featured) {
                    await client.query('UPDATE blogs SET is_featured = false WHERE is_featured = true');
                }

                const result = await client.query(
                    'INSERT INTO blogs (title, content, image_url, images, is_featured, category, subtitle) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                    [title, cleanContent, image_url || null, JSON.stringify(images || []), is_featured || false, category || 'ALL', subtitle || '']
                );
                await client.query('COMMIT');
                return res.status(201).json(result.rows[0]);
            } catch (err: any) {
                await client.query('ROLLBACK');
                console.error('Database Error:', err);
                return res.status(500).json({ error: "Internal Server Error" });
            } finally {
                client.release();
            }
        } else {
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
