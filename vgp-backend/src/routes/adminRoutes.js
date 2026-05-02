const router      = require('express').Router();
const auth        = require('../middleware/authMiddleware');
const adminAuth   = require('../controllers/adminAuthController');
const adminProd   = require('../controllers/adminProductController');
const adminCat    = require('../controllers/adminCategoryController');
const adminVoucher = require('../controllers/adminVoucherController');
const adminCustomer = require('../controllers/adminCustomerController');
const { uploadImages, uploadExcel } = require('../middleware/uploadMiddleware');

// Public
router.post('/login', adminAuth.login);

// All routes below require a valid JWT
router.use(auth);

// ── Products ──────────────────────────────────────────────────────────────────
router.get('/products',                     adminProd.listProducts);
router.post('/products',                    adminProd.createProduct);
// specific static paths before :code param
router.get('/products/export',              adminProd.exportProducts);
router.post('/products/upload-images',      uploadImages.array('images', 10), adminProd.uploadImages);
router.post('/products/import',             uploadExcel.single('file'),        adminProd.importProducts);
router.get('/products/:code',               adminProd.getProduct);
router.put('/products/:code',               adminProd.updateProduct);
router.delete('/products/:code',            adminProd.deleteProduct);
router.get('/products/:code/vouchers',      adminProd.getProductVouchers);
router.post('/products/:code/sync-vouchers', adminProd.syncProductVouchers);

// ── Categories ────────────────────────────────────────────────────────────────
router.get('/categories',               adminCat.getCategories);
router.post('/categories/seed-defaults', adminCat.seedDefaults);
router.post('/categories',              adminCat.createCategory);
router.put('/categories/:id',           adminCat.updateCategory);
router.delete('/categories/:id',        adminCat.deleteCategory);

// ── Vouchers ──────────────────────────────────────────────────────────────────
router.get('/vouchers',      adminVoucher.getVouchers);
router.post('/vouchers',     adminVoucher.createVoucher);
router.get('/vouchers/:id',  adminVoucher.getVoucher);
router.put('/vouchers/:id',  adminVoucher.updateVoucher);
router.delete('/vouchers/:id', adminVoucher.deleteVoucher);

// ── Customers ─────────────────────────────────────────────────────────────────
router.get('/customers/network',             adminCustomer.getNetwork);
router.post('/customers/nodes',              adminCustomer.createNode);
router.put('/customers/nodes/:id',           adminCustomer.updateNode);
router.delete('/customers/nodes/:id',        adminCustomer.deleteNode);
router.patch('/customers/nodes/:id/position', adminCustomer.updateNodePosition);
router.post('/customers/relations',          adminCustomer.createRelation);
router.put('/customers/relations/:id',       adminCustomer.updateRelation);
router.delete('/customers/relations/:id',    adminCustomer.deleteRelation);
router.post('/customers/groups',             adminCustomer.createGroup);
router.put('/customers/groups/:id',          adminCustomer.updateGroup);
router.delete('/customers/groups/:id',       adminCustomer.deleteGroup);

module.exports = router;
