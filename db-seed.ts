import { pool } from './lib/auth';

async function seed() {
    try {
        console.log("Seeding achievements table...");
        
        // Clear existing rows in blogs
        await pool.query('DELETE FROM blogs');
        
        const achievements = [
            {
                title: "Team Alpha-Botics Takes World Gold",
                content: "Secured 1st place overall in design and programming at the International Finals.",
                image_url: "/src/assets/wa-18.15.57-2.jpeg",
                images: ["/src/assets/wa-18.15.57-2.jpeg"],
                category: "VEX IQ",
                subtitle: "2023 Finals",
                is_featured: true
            },
            {
                title: "Regional Innovation Award",
                content: "Awarded for most sustainable structural design in the regional qualifiers.",
                image_url: "/src/assets/wa-18.15.57.jpeg",
                images: ["/src/assets/wa-18.15.57.jpeg"],
                category: "FLL",
                subtitle: "2022 Qualifiers",
                is_featured: false
            },
            {
                title: "Sarah Jenkins: MIT Placement",
                content: "Academy graduate accepted into MIT's prestigious Mechatronics program.",
                image_url: "/src/assets/wa-18.15.58.jpeg",
                images: ["/src/assets/wa-18.15.58.jpeg"],
                category: "FLL",
                subtitle: "Class of 2022",
                is_featured: false
            },
            {
                title: "David Chen: Junior at Tesla",
                content: "VEX IQ team captain now leading automation projects at Tesla Motors.",
                image_url: "/src/assets/wa-18.15.57-3.jpeg",
                images: ["/src/assets/wa-18.15.57-3.jpeg"],
                category: "VEX IQ",
                subtitle: "Class of 2020",
                is_featured: false
            }
        ];

        for (const item of achievements) {
            await pool.query(
                `INSERT INTO blogs (title, content, image_url, images, is_featured, category, subtitle) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [item.title, item.content, item.image_url, JSON.stringify(item.images), item.is_featured, item.category, item.subtitle]
            );
        }

        console.log("Seeding completed successfully.");
    } catch(e) {
        console.error("Seeding failed:", e);
    } finally {
        pool.end();
    }
}

seed();
