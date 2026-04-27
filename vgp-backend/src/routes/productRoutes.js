const router       = require('express').Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const {
  getProducts,
  getProductByCode,
  getFeatured,
  getSaleProducts,
  getSimilar,
} = require('../controllers/productController');

// Static paths MUST be declared before /:productCode
router.get('/featured',                asyncWrapper(getFeatured));
router.get('/sale',                    asyncWrapper(getSaleProducts));
router.get('/',                        asyncWrapper(getProducts));
router.get('/:productCode',            asyncWrapper(getProductByCode));
router.get('/:productCode/similar',    asyncWrapper(getSimilar));

module.exports = router;
