import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { jwtConfig } from '../config/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthService {
  static generateTokens(userId) {
    const accessToken = jwt.sign({ id: userId }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    const refreshToken = jwt.sign({ id: userId }, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  static async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // if (!user || !(await user.comparePassword(password))) {
    //   throw new AppError('Invalid email or password', 401);
    // }

    const { accessToken, refreshToken } = this.generateTokens(user.id);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user.id);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  static async register(userData) {
    const { email } = userData;
    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    const user = await User.create(userData);
    
    return user.toJSON();
  }

  static async getCurrentUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.toJSON();
  }
}