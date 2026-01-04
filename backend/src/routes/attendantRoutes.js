const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/authMiddleware');
const prisma = new PrismaClient();

// Create Attendant (Private)
router.post('/', auth, async (req, res) => {
    const { name } = req.body;
    const { companyId } = req.user;

    if (!companyId) return res.status(400).json({ error: "Contexto de empresa desconhecido." });

    try {
        const newAttendant = await prisma.attendant.create({
            data: { name, companyId }
        });
        res.json(newAttendant);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar atendente.' });
    }
});

// Get All (Scoped by Company)
router.get('/', auth, async (req, res) => {
    const { companyId } = req.user;
    if (!companyId) return res.status(400).json({ error: "Contexto de empresa desconhecido." });

    try {
        const list = await prisma.attendant.findMany({
            where: { companyId }
        });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: 'Erro.' });
    }
});

// Delete (Private & Scoped)
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;

    try {
        // Verify ownership
        const attendant = await prisma.attendant.findFirst({
            where: { id, companyId }
        });

        if (!attendant) return res.status(404).json({ error: "Atendente não encontrado ou sem permissão." });

        await prisma.review.deleteMany({ where: { attendantId: id } });
        await prisma.attendant.delete({ where: { id } });
        res.json({ message: 'Deletado com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar.' });
    }
});

module.exports = router;
