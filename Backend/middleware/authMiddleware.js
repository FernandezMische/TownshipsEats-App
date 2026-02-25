import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

export const protect = async (req, res, next) => {
  let token;
  console.log('🔍 Auth Middleware - Headers:', req.headers);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔍 Token received:', token.substring(0, 20) + '...');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔍 Decoded token:', decoded);
      
      req.user = await UserModel.findById(decoded.id);
      console.log('🔍 User found:', req.user ? 'Yes' : 'No');
      
      if (!req.user) {
        console.log('🔍 User not found in database');
        return res.status(401).json({ success: false, error: 'User not found' });
      }
      
      console.log('🔍 Authentication successful for user:', req.user.id);
      next();
    } catch (error) {
      console.log('🔍 JWT Error:', error.message);
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
  } else {
    console.log('🔍 No authorization header found');
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Role ${req.user.role} not authorized` });
    }
    next();
  };
};