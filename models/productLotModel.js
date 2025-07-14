const db = require('./db');

const ProductLot = {
  create: (data, callback) => {
    const sql = `INSERT INTO product_lots (product_id, lot_number, lot_index, import_date, expire_date, quantity, cost_price, sell_price, promo_price)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [
      data.product_id,
      data.lot_number,
      data.lot_index,
      data.import_date,
      data.expire_date,
      data.quantity,
      data.cost_price,
      data.sell_price,
      data.promo_price
    ], callback);
  },
  findByProductId: (product_id, callback) => {
    db.query('SELECT * FROM product_lots WHERE product_id = ?', [product_id], callback);
  },
  // ดึงคงเหลือและราคาขายล็อตล่าสุดของแต่ละสินค้า
  aggregateByProduct: (callback) => {
    const sql = `
      SELECT l1.product_id,
             SUM(l1.quantity) AS total_quantity,
             l2.sell_price AS latest_sell_price
      FROM product_lots l1
      LEFT JOIN product_lots l2
        ON l2.product_id = l1.product_id
       AND l2.lot_index = (SELECT MAX(l3.lot_index) FROM product_lots l3 WHERE l3.product_id = l1.product_id)
      GROUP BY l1.product_id
    `;
    db.query(sql, callback);
  }
};

module.exports = ProductLot; 