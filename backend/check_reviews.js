const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({ where: { email: 'admin@nacional.com' } });
    if (!user || !user.companyId) {
        console.log("Admin user or company not found");
        return;
    }

    const count = await prisma.review.count({
        where: { attendant: { companyId: user.companyId } }
    });

    console.log(`Total Reviews for Company: ${count}`);

    const reviews = await prisma.review.findMany({
        where: { attendant: { companyId: user.companyId } },
        take: 5
    });
    console.log("Last 5 reviews:", reviews);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
