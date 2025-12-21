const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', ventaController.getAll);
router.get('/resumen', ventaController.getResumen);
router.get('/folio/:folio', ventaController.getByFolio);
router.get('/:id', ventaController.getById);
router.post('/', ventaController.create);
router.put('/:id/anular', ventaController.anular);

module.exports = router;
