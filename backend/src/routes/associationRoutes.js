const express = require('express');
const router = express.Router();
const associationController = require('../controllers/associationController');
const verifyToken = require('../middlewares/authMiddleware'); // Ajuste o path se necessário

// Todas as rotas protégidas por token
router.use(verifyToken);

router.post('/', associationController.uploadMiddleware, associationController.createAssociation);
router.get('/', associationController.getAssociations);
router.delete('/:id', associationController.deleteAssociation);

module.exports = router;
