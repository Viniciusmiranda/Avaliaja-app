const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { company: true } // Include company data
        });
        if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ error: 'Senha incorreta.' });

        const token = jwt.sign(
            { id: user.id, role: user.role, companyId: user.companyId },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                name: user.name,
                role: user.role,
                companySlug: user.company ? user.company.slug : null
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
};

exports.register = async (req, res) => {
    const { companyName, name, email, password, area, whatsapp } = req.body;

    try {
        // Generate Slug
        const slug = companyName.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');

        // Transaction: Create Company -> Attendant -> User
        const result = await prisma.$transaction(async (prisma) => {
            const newCompany = await prisma.company.create({
                data: {
                    name: companyName,
                    slug,
                    area,
                    whatsapp
                }
            });

            // Default Attendant
            await prisma.attendant.create({
                data: {
                    name: "Geral",
                    companyId: newCompany.id
                }
            });

            // Admin User
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'ADMIN',
                    companyId: newCompany.id
                }
            });

            // Auto-Login: Generate Token
            const token = jwt.sign(
                { id: newUser.id, role: newUser.role, companyId: newCompany.id },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            return { token, user: newUser, slug };
        });

        res.status(201).json({
            message: 'Empresa registrada!',
            token: result.token,
            user: {
                name: result.user.name,
                role: result.user.role,
                companySlug: result.slug
            },
            slug: result.slug
        });
    } catch (err) {
        console.error(err);
        if (err.code === 'P2002') {
            const field = err.meta ? err.meta.target : 'campo';
            return res.status(400).json({ error: `Já existe um registro com este ${field} (Email ou Empresa).` });
        }
        res.status(500).json({ error: 'Erro ao registrar empresa.' });
    }
};
