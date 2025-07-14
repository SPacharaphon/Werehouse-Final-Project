const db = require('./db');

exports.findByUsername = (username, callback) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], callback);
};

exports.createUser = (userData, callback) => {
    db.query('INSERT INTO users SET ?', userData, callback);
};