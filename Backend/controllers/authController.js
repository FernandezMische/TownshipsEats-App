import UserModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const userId = await UserModel.create({ username, email, password, role });
    const newUser = await UserModel.findById(userId);
    const token = generateToken(newUser);

    res.status(201).json({ success: true, data: { ...newUser, token } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isPasswordValid = await UserModel.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, error: `You are a ${user.role}, not a ${role}` });
    }

    const token = generateToken(user);
    res.json({ 
      success: true, 
      data: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        token 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { username, email, address } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, error: 'Username and email are required' });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    const updatedUser = await UserModel.updateProfile(req.user.id, {
      username: String(username).trim(),
      email: String(email).trim().toLowerCase(),
      address: address ? String(address).trim() : null
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
