import { auth } from "../../../lib/auth.js";
import formidable from "formidable";
import fs from "fs";
import sharp from "sharp";
import { put } from "@vercel/blob";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: any, res: any) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || session.user.role !== "admin") {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const form = formidable({
            maxFileSize: 10 * 1024 * 1024, // 10MB
        });

        const [fields, files] = await form.parse(req);
        
        const fileArray = files.file;
        if (!fileArray || fileArray.length === 0) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        
        const file = fileArray[0];

        const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
        if (!file.mimetype || !ALLOWED_MIMES.includes(file.mimetype)) {
            return res.status(400).json({ error: "Only JPEG, PNG, and WebP images are allowed" });
        }

        // Compress image using sharp - allow larger dimensions for blogs
        const buffer = await fs.promises.readFile(file.filepath);
        const compressedBuffer = await sharp(buffer)
            .resize(1920, 1080, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        // Upload to Vercel Blob
        const safeName = (file.originalFilename || 'upload.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
        const blobName = `blogs/${session.user.id}/${Date.now()}-${safeName}`;

        const blob = await put(blobName, compressedBuffer, {
            access: 'public',
            contentType: 'image/jpeg',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        return res.status(200).json({ url: blob.url });

    } catch (err: any) {
        console.error('Upload Error:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
