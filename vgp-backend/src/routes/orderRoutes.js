const router       = require('express').Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const { createOrder, getOrder } = require('../controllers/orderController');

router.post('/',                      asyncWrapper(createOrder));
router.get('/:orderNumber',           asyncWrapper(getOrder));

module.exports = router;
