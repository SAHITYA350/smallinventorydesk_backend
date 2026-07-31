import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || jwtConfig.secret || 'secretkey123';
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    secret,
    { expiresIn: jwtConfig.expiresIn || '7d' }
  );
};

export default generateToken;