const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    process.env.JWT_SECRET = 'default_secret_key_for_development_only';
}

exports.register = (req, res) => {
    const { name, username, password, passwordConfirm, role } = req.body;
    const roleMap = { owner: 2, admin: 1, cashier: 3, warehouse: 4, delivery: 5 };
    const role_id = roleMap[role];

    if (!role_id) {
        return res.json({ success: false, message: 'Invalid role selected' });
    }

    userModel.findByUsername(username, async (error, result) => {
        if (error) return res.json({ success: false, message: 'DB error' });
        if (result.length > 0) return res.json({ success: false, message: 'Username already in use' });
        if (password !== passwordConfirm) return res.json({ success: false, message: 'Passwords do not match' });

        const hashedPassword = await bcrypt.hash(password, 8);
        userModel.createUser({ name, username, password: hashedPassword, role_id }, (err, result) => {
            if (err) {
                console.error('Create user error:', err);
                return res.json({ success: false, message: 'DB error' });
            }
            return res.json({ success: true, message: 'User registered successfully' });
        });
    });
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        userModel.findByUsername(username, async (error, results) => {
            if (error) {
                console.log(error);
                return res.render('login', {
                    message: 'An error occurred during login'
                });
            }

            if (results.length === 0) {
                return res.render('login', {
                    message: 'Invalid username or password'
                });
            }

            const isMatch = await bcrypt.compare(password, results[0].password);
            if (!isMatch) {
                return res.render('login', {
                    message: 'Invalid username or password'
                });
            }

            try {
                const token = jwt.sign(
                    { 
                        id: results[0].id, 
                        username: results[0].username,
                        role_id: results[0].role_id,
                        name: results[0].name
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                res.cookie('jwt', token, {
                    httpOnly: true,
                    maxAge: 3600000 
                });

                return res.redirect('/dashboard');
            } catch (jwtError) {
                console.error('JWT Error:', jwtError);
                return res.render('login', {
                    message: 'Authentication error occurred'
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.render('login', {
            message: 'An error occurred during login'
        });
    }
}
