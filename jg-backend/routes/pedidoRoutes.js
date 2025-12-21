const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', pedidoController.getAll);
router.get('/:id', pedidoController.getById);
router.post('/', pedidoController.create);
router.put('/:id', pedidoController.update);
router.put('/:id/estado', pedidoController.cambiarEstado);
router.post('/:id/convertir-venta', pedidoController.convertirAVenta);
router.put('/:id/cancelar', pedidoController.cancelar);
router.delete('/:id', pedidoController.remove);

module.exports = router;
