const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    try {

        const actualToken = token.split(" ")[1];

        const decoded = jwt.verify(
            actualToken,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid token"
        });

    }
}

module.exports = authMiddleware;