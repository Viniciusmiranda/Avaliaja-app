const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get WhatsApp Logs
exports.getWhatsappLogs = async (req, res) => {
    try {
        const { companyId } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.whatsappLog.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.whatsappLog.count({ where: { companyId } })
        ]);

        res.json({ logs, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar logs do WhatsApp' });
    }
};

// Get LnAssist Logs
exports.getLnAssistLogs = async (req, res) => {
    try {
        const { companyId } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.lnAssistLog.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.lnAssistLog.count({ where: { companyId } })
        ]);

        res.json({ logs, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar logs do LnAssist' });
    }
};
