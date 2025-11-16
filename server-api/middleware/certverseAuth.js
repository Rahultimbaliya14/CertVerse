const jwt = require('jsonwebtoken');
const CertverseUser = require('../models/certverseUser');

const authenticateTokenCertverse = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access token required' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await CertverseUser.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token - user not found' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during authentication' 
        });
    }
};

module.exports = { authenticateTokenCertverse };
