const router = require('express').Router();

router.use('/products',   require('./productRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/orders',     require('./orderRoutes'));
router.use('/promos',     require('./promoRoutes'));
router.use('/admin',      require('./adminRoutes'));

module.exports = router;
