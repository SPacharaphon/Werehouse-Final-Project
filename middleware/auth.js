const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                console.log(decodedToken);
                req.user = decodedToken;
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
};

// Middleware to check if user has specific role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/login');
        }

        // Check if user's role is in the allowed roles array
        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).render('error', {
                message: 'Access denied. You do not have permission to access this page.',
                user: req.user
            });
        }
    };
};

module.exports = { requireAuth, requireRole }; 