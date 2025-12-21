const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', clienteController.getAll);
router.get('/generico', clienteController.getGenerico);
router.get('/buscar/:ci_nit', clienteController.getByCiNit);
router.get('/:id', clienteController.getById);
router.get('/:id/deuda', clienteController.checkDeuda);
router.post('/', clienteController.create);
router.put('/:id', clienteController.update);
router.delete('/:id', clienteController.remove);

module.exports = router;
