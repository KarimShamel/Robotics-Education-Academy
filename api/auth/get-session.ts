import { auth } from "../../lib/auth";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return res.status(401).json({ authenticated: false });
        }
        return res.status(200).json({
            authenticated: true,
            user: {
                id: session.user.id,
                role: session.user.role,
                name: session.user.name,
                email: session.user.email
            }
        });
    } catch (err) {
        console.error("Session check error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
