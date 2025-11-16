const express = require('express');
const jwt = require('jsonwebtoken');
const CertverseUser = require('../models/certverseUser');

const router = express.Router();
const isRegisterAuthEnabled = process.env.REGISTER_AUTHENTICATE == "true";

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        issuer: process.env.JWT_ISSUER || 'Certverse'
    });
};

const { authenticateTokenCertverse } = require('../middleware/certverseAuth');

// Register route
const registerMiddlewares = [];
if (isRegisterAuthEnabled) {
    registerMiddlewares.push(authenticateTokenCertverse);
}
router.post('/register', async (req, res) => {

    try {
        const { email, password, fullName, issuedAt, expiresAt, isVerified } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists (email unique)
        const existingUser = await CertverseUser.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new CertverseUser({ email, password, fullName, issuedAt, expiresAt, isVerified });
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Certverse user registered successfully',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Certverse registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await CertverseUser.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Certverse login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Get all Certverse users (protected)
router.get('/getAll', authenticateTokenCertverse, async (req, res) => {
    try {
        const users = await CertverseUser.find({});
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users
            }
        });
    } catch (error) {
        console.error('Get all certverse users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving users'
        });
    }
});

// Get user profile
router.get('/profile', authenticateTokenCertverse, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Certverse profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving profile'
        });
    }
});

// Verify token route
router.get('/verify', authenticateTokenCertverse, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            user: req.user
        }
    });
});

module.exports = router;
