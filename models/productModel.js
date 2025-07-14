const db = require('./db');

const Product = {
  create: (data, callback) => {
    const sql = 'INSERT INTO products (code, name, category) VALUES (?, ?, ?)';
    db.query(sql, [data.code, data.name, data.category], callback);
  },
  findAll: (callback) => {
    db.query('SELECT * FROM products', callback);
  },
  findById: (id, callback) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], callback);
  }
};

module.exports = Product;