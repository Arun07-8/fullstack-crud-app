import jwt from "jsonwebtoken";

const authMiddleware = (cookieName, requiredRole) => {
  return (req, res, next) => {
    const token = req.cookies?.[cookieName];

    if (!token) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      if (decoded.role !== requiredRole) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  };
};

export default authMiddleware;