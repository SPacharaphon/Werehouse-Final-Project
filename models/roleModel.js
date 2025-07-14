const userModel = require('../models/userModel');

exports.findByName = (roleName, callback) => {
  db.query("SELECT id FROM roles WHERE name = ?", [roleName], callback);
};