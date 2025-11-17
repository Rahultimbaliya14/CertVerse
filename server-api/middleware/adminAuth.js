const { authenticateTokenCertverse } = require('./certverseAuth');

const checkAdmin = async (req, res, next) => {
    try {
        // First authenticate the token
        authenticateTokenCertverse(req, res, async () => {
            try {
                // Check if user is admin
                if (!req.user || !req.user.isAdmin) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. Admin privileges required.'
                    });
                }
                next();
            } catch (error) {
                console.error('Admin check error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Server error during admin verification'
                });
            }
        });
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in admin authentication'
        });
    }
};

const adminAuth = [authenticateTokenCertverse, checkAdmin];

module.exports = { adminAuth };
