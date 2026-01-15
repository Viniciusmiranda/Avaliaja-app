const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do Multer para Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads'); // Ajuste conforme estrutura
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'assoc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

exports.uploadMiddleware = upload.single('logo');

exports.createAssociation = async (req, res) => {
    try {
        const { name } = req.body;
        const { companyId } = req.user; // Token JWT deve fornecer isso

        if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
        if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

        let logoUrl = null;
        if (req.file) {
            // Em produção, idealmente salvaria caminhos relativos ou URL completa se usar S3
            // Aqui vamos salvar o caminho relativo para servir estático
            logoUrl = `/uploads/${req.file.filename}`;
        }

        const newAssoc = await prisma.association.create({
            data: {
                name,
                logo: logoUrl,
                companyId: String(companyId) // Garantir string
            }
        });

        res.status(201).json(newAssoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar associação' });
    }
};

exports.getAssociations = async (req, res) => {
    try {
        const { companyId } = req.user;

        const list = await prisma.association.findMany({
            where: { companyId: String(companyId) },
            orderBy: { createdAt: 'desc' }
        });

        res.json(list);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar associações' });
    }
};

exports.deleteAssociation = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar antes para deletar o arquivo
        const assoc = await prisma.association.findUnique({ where: { id } });

        if (!assoc) return res.status(404).json({ error: 'Não encontrado' });

        if (assoc.logo) {
            // Remover arquivo físico
            const filePath = path.join(__dirname, '../../', assoc.logo);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await prisma.association.delete({ where: { id } });

        res.json({ message: 'Deletado com sucesso' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar' });
    }
};
