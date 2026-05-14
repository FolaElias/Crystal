import { Router } from 'express';
import {
  register, registerValidation,
  login, loginValidation,
  verifyLoginOtp, resendLoginOtp,
  refresh, logout,
  checkUsername,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/check-username', checkUsername);
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/login/verify-otp', verifyLoginOtp);
router.post('/login/resend-otp', resendLoginOtp);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
