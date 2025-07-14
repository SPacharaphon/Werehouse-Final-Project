const express = require('express');
const { requireAuth, requireRole, redirectIfAuthenticated } = require('../middleware/auth');
const productController = require('../controllers/product');
const router = express.Router();
const Product = require('../models/productModel');
const ProductLot = require('../models/productLotModel');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('register', { message: undefined, name: '', username: '', role: '' });
});

router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login');
});

router.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

router.get('/inventory', requireAuth, requireRole(['admin', 'warehouse']), productController.inventoryPage, (req, res) => {
    const { products, lotsMap, search } = req.inventoryData;
    res.render('inventory', { user: req.user, products, lotsMap, search });
});

router.get('/inventory/add', requireAuth, requireRole(['admin', 'warehouse']), (req, res) => {
    res.render('addProduct', { user: req.user });
});

router.post('/inventory/add', requireAuth, requireRole(['admin', 'warehouse']), productController.addProduct);

router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/login');
});

router.post('/add-product', requireAuth, requireRole(['admin', 'warehouse']), productController.addProduct);

// แสดงฟอร์มเพิ่มสินค้า
router.get('/products/add', (req, res) => {
  res.render('addProduct');
});

// แสดงรายการสินค้า
router.get('/products', (req, res) => {
  Product.findAll((err, products) => {
    if (err) return res.status(500).send('Error loading products');
    res.render('products', { products });
  });
});

// แสดงฟอร์มเพิ่มล็อตสินค้า (ต้องเลือกสินค้าก่อน)
router.get('/products/:id/lots/add', (req, res) => {
  const product_id = req.params.id;
  res.render('addProductLot', { product_id });
});

// แสดงรายการล็อตสินค้าของสินค้านั้น
router.get('/products/:id/lots', (req, res) => {
  const product_id = req.params.id;
  ProductLot.findByProductId(product_id, (err, lots) => {
    if (err) return res.status(500).send('Error loading product lots');
    res.render('productLots', { product_id, lots });
  });
});

module.exports = router;