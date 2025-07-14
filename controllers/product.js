const Product = require('../models/productModel');
const ProductLot = require('../models/productLotModel');

// Controller สำหรับหน้า inventory
exports.inventoryPage = (req, res, next) => {
  const search = req.query.q ? req.query.q.trim().toLowerCase() : '';
  Product.findAll((err, products) => {
    if (err) return next(err);
    ProductLot.aggregateByProduct((err2, lotsAgg) => {
      if (err2) return next(err2);
      const lotsMap = {};
      lotsAgg.forEach(lot => {
        lotsMap[lot.product_id] = lot;
      });
      let filteredProducts = products;
      if (search) {
        filteredProducts = products.filter(p =>
          p.code.toLowerCase().includes(search) ||
          p.name.toLowerCase().includes(search)
        );
      }
      req.inventoryData = { products: filteredProducts, lotsMap, search };
      next();
    });
  });
};

exports.addProduct = (req, res) => {
  const { code, name, category } = req.body;
  Product.create({ code, name, category }, (err, result) => {
    if (err) return res.status(500).render('error', { message: 'Error adding product' });
    res.redirect('/inventory');
  });
};

exports.addProductLot = (req, res) => {
  const { product_id, lot_number, lot_index, import_date, expire_date, quantity, cost_price, sell_price, promo_price } = req.body;
  ProductLot.create({
    product_id,
    lot_number,
    lot_index,
    import_date,
    expire_date,
    quantity,
    cost_price,
    sell_price,
    promo_price
  }, (err, result) => {
    if (err) return res.status(500).render('error', { message: 'Error adding product lot' });
    res.redirect('/products/' + product_id + '/lots');
  });
};