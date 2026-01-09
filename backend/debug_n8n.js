require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                notifications: true
            }
        });

        console.log("=== COMPANHIAS ENCONTRADAS ===");
        companies.forEach(c => {
            console.log(`\nID: ${c.id}`);
            console.log(`Nome: ${c.name}`);
            console.log(`Slug: ${c.slug}`);
            console.log('Notifications (Raw):', c.notifications);
            console.log('Typeof Notifications:', typeof c.notifications);

            if (c.notifications && c.notifications.webhookUrl) {
                console.log(`✅ Webhook URL encontrada: ${c.notifications.webhookUrl}`);
            } else {
                console.log(`❌ Webhook URL NÃO encontrada ou vazia.`);
            }
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
