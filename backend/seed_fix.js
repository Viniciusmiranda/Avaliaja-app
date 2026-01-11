const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Fix...");

    // 1. Ensure User exists
    let user = await prisma.user.findUnique({ where: { email: 'admin@nacional.com' } });
    if (!user) {
        console.log("User not found. Run server to seed user first.");
        return;
    }

    // 2. Create Company if not exists
    let company = await prisma.company.findUnique({ where: { slug: 'nacional' } });
    if (!company) {
        company = await prisma.company.create({
            data: {
                name: 'Nacional Assistência',
                slug: 'nacional',
                area: 'Seguros',
                plan: 'GRANDES'
            }
        });
        console.log("Company created:", company.name);
    }

    // 3. Link User to Company
    await prisma.user.update({
        where: { id: user.id },
        data: { companyId: company.id }
    });
    console.log("User linked to Company.");

    // 4. Create Sample Attendants
    const attNames = ['João Silva', 'Maria Souza', 'Pedro Santos'];
    const attendants = [];
    for (const name of attNames) {
        let att = await prisma.attendant.findFirst({ where: { name, companyId: company.id } });
        if (!att) {
            att = await prisma.attendant.create({
                data: {
                    name,
                    companyId: company.id,
                    phone: '11999999999',
                    sector: 'Vendas',
                    active: true
                }
            });
        }
        attendants.push(att);
    }
    console.log(`Ensured ${attendants.length} Attendants.`);

    // 5. Create Sample Reviews (distributed locations for map)
    const locations = [
        { city: 'São Paulo', state: 'SP' },
        { city: 'Rio de Janeiro', state: 'RJ' },
        { city: 'Belo Horizonte', state: 'MG' },
        { city: 'Curitiba', state: 'PR' },
        { city: 'Porto Alegre', state: 'RS' },
        { city: 'Salvador', state: 'BA' },
        { city: 'Recife', state: 'PE' },
        { city: 'Fortaleza', state: 'CE' },
        { city: 'Manaus', state: 'AM' },
        { city: 'Brasília', state: 'DF' }
    ];

    const count = await prisma.review.count({ where: { attendant: { companyId: company.id } } });
    if (count < 30) {
        console.log("Creating 30 sample reviews...");
        for (let i = 0; i < 30; i++) {
            const loc = locations[i % locations.length];
            const att = attendants[i % attendants.length];
            await prisma.review.create({
                data: {
                    stars: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                    comment: `Ótimo atendimento em ${loc.city}!`,
                    attendantId: att.id,
                    city: loc.city,
                    state: loc.state,
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
                }
            });
        }
        console.log("Sample reviews created.");
    }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
