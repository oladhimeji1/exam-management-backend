import jwt from 'jsonwebtoken';
import { body } from 'express-validator';

import { AuthService } from '../services/authService.js';
import { StudentService } from '../services/studentService.js';
import User from '../models/User.js';

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 6 characters'),
];

export const registerValidation = [
  body("email").isEmail().withMessage('Please provide a valid email'),
  // body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('guestClass').isIn(['JSS1', 'JSS2', 'SS1', 'SS2']).withMessage('Invalid class'),
  body('role').isIn(['admin', 'teacher', 'student', 'guest']).withMessage('Invalid role'),
];

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password)
    const result = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const authorizeLogin = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const tokens = AuthService.generateTokens(user.id); // accessToken + refreshToken

    res.status(200).json({
      success: true,
      message: 'Authorized successfully',
      data: {
        user,
        ...tokens,
      },
    });
  } catch (error) {
    console.error('Token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const register = async (req, res, next) => {
  try {
    var userData = req.body;
    userData ={
      ...userData,
      class: userData.guestClass
    }
    const user = await AuthService.register(userData);

    if (userData.role === 'student') {
      const studentData = {
        userId: user.id,
        classId: userData.classId || null,
        parentEmail: userData.email || null,
        dateOfBirth: userData.dateOfBirth || null,
      } 
      await StudentService.createStudentRecord(studentData);
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const link = `http://localhost:5173/login?token=${token}`;


    res.status(201).json({
      success: true,
      message: 'User registered successfully, A link have been sent to your email containing your exam infomation',
      data: user,
      link: link
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await AuthService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};