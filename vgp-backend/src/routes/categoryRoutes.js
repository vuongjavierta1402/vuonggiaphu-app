const router       = require('express').Router();
const asyncWrapper = require('../middleware/asyncWrapper');
const { getCategories, getBrands } = require('../controllers/categoryController');

router.get('/',        asyncWrapper(getCategories));
router.get('/brands',  asyncWrapper(getBrands));

module.exports = router;
