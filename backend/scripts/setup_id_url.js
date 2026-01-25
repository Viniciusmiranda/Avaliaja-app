
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Find the first company
    const company = await prisma.company.findFirst();

    if (!company) {
        console.log("No company found. Creating one...");
        await prisma.company.create({
            data: {
                name: "Empresa Teste",
                slug: "empresa-teste",
                id_url: "acesso-secreto-123",
                users: {
                    create: {
                        name: "Admin Teste",
                        email: "admin@teste.com",
                        password: "hash",
                        role: "admin"
                    }
                }
            }
        });
        console.log("Created company with id_url: acesso-secreto-123");
    } else {
        console.log(`Updating company ${company.name} with id_url...`);
        await prisma.company.update({
            where: { id: company.id },
            data: { id_url: "acesso-secreto-123" }
        });

        // Ensure user exists
        const user = await prisma.user.findFirst({ where: { companyId: company.id } });
        if (!user) {
            await prisma.user.create({
                data: {
                    name: "Admin Existing",
                    email: `admin_${company.slug}@teste.com`,
                    password: "hash",
                    role: "admin",
                    companyId: company.id
                }
            });
            console.log("Created admin user for company.");
        }
        console.log("Updated company with id_url: acesso-secreto-123");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
