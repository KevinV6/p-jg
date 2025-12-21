const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { authMiddleware } = require('../middleware/auth');
const { uploadSingle } = require('../config/storage');

router.use(authMiddleware);

router.get('/', productoController.getAll);
router.get('/precios-variante', productoController.getPreciosVariante);
router.get('/variantes-catalogo/search', productoController.searchVariantesCatalogo);
router.get('/opciones-catalogo/search', productoController.searchOpcionesCatalogo);
router.get('/:id', productoController.getById);
router.post('/', productoController.create);
router.put('/:id', productoController.update);
router.delete('/:id', productoController.remove);
router.post('/upload-imagen', uploadSingle, productoController.uploadProductImage);
router.post('/upload-variante-imagen', uploadSingle, productoController.uploadVarianteImage);
router.put('/:id/imagen', uploadSingle, productoController.updateProductImage);

module.exports = router;
