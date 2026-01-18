const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/whatsapp', logsController.getWhatsappLogs);
router.get('/lnassist', logsController.getLnAssistLogs);

module.exports = router;
