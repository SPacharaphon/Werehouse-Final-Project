const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcryt = require('bcryptjs');

// Ensure JWT_SECRET is available
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    process.env.JWT_SECRET = 'default_secret_key_for_development_only';
}

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(req.body);

    const { name, username, password, passwordConfirm, role } = req.body;

    // Validate role
    const validRoles = ['owner', 'admin', 'cashier', 'warehouse', 'delivery'];
    if (!validRoles.includes(role)) {
        return res.render('register', {
            message: 'Invalid role selected'
        });
    }

    db.query('SELECT username FROM users WHERE username = ?', [username], async (error, result) => {
        if (error) {
            console.log(error);
            return res.render('register', {
                message: 'An error occurred during registration'
            });
        }

        if (result.length > 0) {
            return res.render('register', {
                message: 'That username is already in use'
            });
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        let hashedPassword = await bcryt.hash(password, 8);
        console.log(hashedPassword);
        {
            db.query('INSERT INTO users SET ?', { 
                name: name, 
                username: username, 
                password: hashedPassword,
                role: role 
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.render('register', {
                        message: 'An error occurred during registration'
                    });
                } else {
                    console.log(result);
                    return res.render('register', {
                        message: 'User registered successfully'
                    })
                }
            })
        }
    })
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
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

            // Compare password
            const isMatch = await bcryt.compare(password, results[0].password);
            if (!isMatch) {
                return res.render('login', {
                    message: 'Invalid username or password'
                });
            }

            try {
                // Create JWT token with role information
                const token = jwt.sign(
                    { 
                        id: results[0].id, 
                        username: results[0].username,
                        role: results[0].role,
                        name: results[0].name
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                // Set cookie
                res.cookie('jwt', token, {
                    httpOnly: true,
                    maxAge: 3600000 // 1 hour
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
