import { Router } from 'express';
import { getMe, setup2FA, confirm2FA } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/me', getMe);
router.post('/2fa/setup', setup2FA);
router.post('/2fa/confirm', confirm2FA);

export default router;
