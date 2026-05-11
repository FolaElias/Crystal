import { Router } from 'express';
import { getWallet, getDepositAddress, getTransactions } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getWallet);
router.get('/deposit/:symbol', getDepositAddress);
router.get('/transactions', getTransactions);

export default router;
