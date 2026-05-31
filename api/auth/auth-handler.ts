import { auth } from "../../lib/auth.js";
import { toNodeHandler } from "better-auth/node";

export default function handler(req: any, res: any) {
    return toNodeHandler(auth)(req, res);
}
