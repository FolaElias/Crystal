import { Router } from 'express';
import {
  register, registerValidation,
  login, loginValidation,
  refresh, logout,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
