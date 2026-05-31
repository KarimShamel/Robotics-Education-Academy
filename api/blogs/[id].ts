import { auth, pool } from "../../lib/auth";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const putSchema = z.object({
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
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: "ID is required" });
        }

        const idNum = parseInt(id, 10);
        if (isNaN(idNum)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        if (req.method === "GET") {
            const result = await pool.query(
                'SELECT id, title, content, image_url, images, is_featured, category, subtitle, created_at, updated_at FROM blogs WHERE id = $1',
                [idNum]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Blog not found" });
            }
            return res.status(200).json(result.rows[0]);
        }

        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || session.user.role !== "admin") {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (req.method === "PUT") {
            const parseResult = putSchema.safeParse(req.body);
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

            if (is_featured) {
                await pool.query('UPDATE blogs SET is_featured = false WHERE is_featured = true AND id != $1', [idNum]);
            }

            const result = await pool.query(
                `UPDATE blogs 
                 SET title = $1, content = $2, image_url = $3, images = $4, is_featured = $5, category = $6, subtitle = $7, updated_at = NOW()
                 WHERE id = $8 RETURNING *`,
                [title, cleanContent, image_url || null, JSON.stringify(images || []), is_featured || false, category || 'ALL', subtitle || '', idNum]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Blog not found" });
            }

            return res.status(200).json(result.rows[0]);
        } else if (req.method === "DELETE") {
            const result = await pool.query('DELETE FROM blogs WHERE id = $1 RETURNING *', [idNum]);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Blog not found" });
            }

            return res.status(200).json({ message: "Blog deleted successfully" });
        } else {
            res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
