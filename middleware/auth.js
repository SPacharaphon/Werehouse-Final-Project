const jwt = require('jsonwebtoken');

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

function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/login');
        }
        // allowedRoles เป็น array ของชื่อ role เช่น ['admin', 'warehouse']
        // ต้องแปลง role_id เป็นชื่อ role ก่อน
        const roleMap = { 1: 'admin', 2: 'owner', 3: 'cashier', 4: 'warehouse', 5: 'delivery' };
        const userRoleName = roleMap[req.user.role_id];
        if (!allowedRoles.includes(userRoleName)) {
            return res.status(403).render('error', { message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้' });
        }
        next();
    };
}

const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (!err && decodedToken) {
                return res.redirect('/dashboard');
            }
            next();
        });
    } else {
        next();
    }
};

module.exports = { requireAuth, requireRole, redirectIfAuthenticated };