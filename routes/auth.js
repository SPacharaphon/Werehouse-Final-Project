const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const productController = require('../controllers/product');

router.post('/register', authController.register);
router.post('/login', authController.login);

// เพิ่มสินค้า
router.post('/products/add', productController.addProduct);

// เพิ่มล็อตสินค้า
router.post('/products/:id/lots/add', productController.addProductLot);

module.exports = router;