import { Router } from 'express';
import {
  login,
  register,
  refreshToken,
  getCurrentUser,
  logout,
  loginValidation,
  registerValidation,
  authorizeLogin,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
// import { adminOnly } from '../middleware/roleAuth.js';
import validate from '../middleware/validation.js';

const router = Router();

router.post('/login', validate(loginValidation), login);

router.get('/authorize-login', authorizeLogin);

router.post('/register', validate(registerValidation), register);
// router.post('/register', authenticate, adminOnly, validate(registerValidation), register);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', logout);

export default router;