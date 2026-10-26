import { Router } from 'express';
import { login, getMe, getDemoAccounts } from '../controllers/authController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateJwt, getMe);
router.get('/demo-accounts', getDemoAccounts);

export default router;
