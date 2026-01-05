const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Settings (Logo, Color, etc)
exports.getSettings = async (req, res) => {
    try {
        const { companyId } = req.user;
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { logo: true, primaryColor: true, settings: true, slug: true, name: true }
        });

        if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

        res.json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
};

// Update Settings
exports.updateSettings = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { primaryColor, settings } = req.body;
        // File from multer
        const logoFile = req.file;

        const updateData = {};
        if (primaryColor) updateData.primaryColor = primaryColor;
        if (settings) updateData.settings = JSON.parse(settings); // Envia como string JSON do front

        if (logoFile) {
            // Save relative path
            updateData.logo = `/uploads/${logoFile.filename}`;
        }

        const company = await prisma.company.update({
            where: { id: companyId },
            data: updateData
        });

        res.json({ message: 'Configurações atualizadas!', company });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar configurações' });
    }
};

// Public Settings (For Evaluation Page - No Auth)
exports.getPublicSettings = async (req, res) => {
    try {
        const { slug } = req.params;
        const company = await prisma.company.findUnique({
            where: { slug: slug },
            select: { logo: true, primaryColor: true, settings: true, name: true }
        });

        if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

        res.json(company);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar dados públicos' });
    }
};
