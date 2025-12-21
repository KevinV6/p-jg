const express = require('express');
const router = express.Router();
const cobroController = require('../controllers/cobroController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', cobroController.getAll);
router.get('/resumen', cobroController.getResumen);
router.get('/:id', cobroController.getById);
router.post('/', cobroController.create);
router.put('/:id', cobroController.update);
router.put('/:id/pagar', cobroController.marcarPagado);
router.put('/:id/anular', cobroController.anular);

module.exports = router;
