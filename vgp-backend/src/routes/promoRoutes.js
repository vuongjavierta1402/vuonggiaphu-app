const router       = require('express').Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const { validatePromo } = require('../controllers/promoController');

router.post('/validate', asyncWrapper(validatePromo));

module.exports = router;
