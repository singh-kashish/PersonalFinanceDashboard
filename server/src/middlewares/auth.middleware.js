const jwt = require('jsonwebtoken');

const AppError = require('../utils/AppError');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError(
                'Access denied. No token provided.',
                401
            );
        }

        const parts = authHeader.split(' ');

        if (
            parts.length !== 2 ||
            parts[0] !== 'Bearer'
        ) {
            throw new AppError(
                'Invalid authorization header format.',
                401
            );
        }

        const token = parts[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        next(
            error.statusCode
                ? error
                : new AppError(
                      'Invalid or expired token.',
                      401
                  )
        );
    }
};

module.exports = authMiddleware;