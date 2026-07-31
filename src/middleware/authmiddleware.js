import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.js";

const auth = (req, res, next) => {
  let token = req.cookies?.token || req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Authorization token missing",
    });
  }

  token = token.trim();
  if (token.startsWith("Bearer ")) {
    token = token.substring(7).trim();
  }
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1).trim();
  }

  try {
    const secret = process.env.JWT_SECRET || jwtConfig.secret || 'secretkey123';
    const decoded = jwt.verify(token, secret);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      errorDetail: err.message,
    });
  }
};

export const protect = auth;
export default auth;