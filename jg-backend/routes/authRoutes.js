const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { uploadSingle } = require('../config/storage');

// Rutas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken);
router.post('/request-password-reset', authController.requestPasswordReset);

// Rutas protegidas
router.use(authMiddleware);
router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/profile/avatar', uploadSingle, authController.updateAvatar);
router.put('/change-password', authController.changePassword);

module.exports = router;
