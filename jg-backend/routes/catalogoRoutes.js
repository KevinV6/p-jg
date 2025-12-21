const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Categorías
router.get('/categorias', catalogoController.getAllCategorias);
router.post('/categorias', catalogoController.createCategoria);
router.put('/categorias/:id', catalogoController.updateCategoria);
router.delete('/categorias/:id', catalogoController.deleteCategoria);

// Unidades de medida
router.get('/unidades', catalogoController.getAllUnidades);
router.post('/unidades', catalogoController.createUnidad);
router.put('/unidades/:id', catalogoController.updateUnidad);
router.delete('/unidades/:id', catalogoController.deleteUnidad);

module.exports = router;
