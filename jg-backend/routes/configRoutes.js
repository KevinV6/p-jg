const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { uploadSingle } = require('../config/storage');

router.use(authMiddleware);

// Dashboard - todos los usuarios
router.get('/dashboard', configController.getDashboard);

// Notificaciones
router.get('/notificaciones', configController.getNotificaciones);
router.put('/notificaciones/:id/leida', configController.marcarNotificacionLeida);
router.put('/notificaciones/leer-todas', configController.marcarTodasLeidas);

// Configuración empresa - solo admin
router.get('/empresa', configController.getConfig);
router.put('/empresa', requireRole('admin'), configController.updateConfig);
router.put('/empresa/logo', requireRole('admin'), uploadSingle, configController.uploadLogo);

module.exports = router;
