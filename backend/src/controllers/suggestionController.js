const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSuggestions = async (req, res) => {
    try {
        const suggestions = await prisma.suggestion.findMany({
            orderBy: { likes: 'desc' }
        });
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar sugestões' });
    }
};

exports.createSuggestion = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Texto obrigatório' });

        const suggestion = await prisma.suggestion.create({
            data: { text }
        });
        res.json(suggestion);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar sugestão' });
    }
};

exports.voteSuggestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'like' or 'dislike'

        // Get user ID from token (middleware)
        // Adjust based on your auth middleware: usually req.user.id or req.userId
        const userId = req.user?.id || req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não identificado.' });
        }

        const suggestionId = parseInt(id);

        // 1. Check if already voted
        const existingVote = await prisma.suggestionVote.findUnique({
            where: {
                userId_suggestionId: {
                    userId: userId,
                    suggestionId: suggestionId
                }
            }
        });

        if (existingVote) {
            return res.status(400).json({ error: 'Você já votou nesta sugestão.' });
        }

        // 2. Transaction: Create Vote + Increment Count
        await prisma.$transaction([
            prisma.suggestionVote.create({
                data: {
                    userId: userId,
                    suggestionId: suggestionId,
                    type: type
                }
            }),
            prisma.suggestion.update({
                where: { id: suggestionId },
                data: {
                    likes: type === 'like' ? { increment: 1 } : undefined,
                    dislikes: type === 'dislike' ? { increment: 1 } : undefined
                }
            })
        ]);

        res.json({ success: true });
    } catch (error) {
        console.error("Vote Error:", error);
        res.status(500).json({ error: 'Erro ao computar voto' });
    }
};
