import { Router } from 'express';
import { getLiveCrowd, getCrowdHistory, updateCrowdManually } from '../controllers/crowdController';

const router = Router();

router.get('/live', getLiveCrowd);
router.get('/history', getCrowdHistory);
router.post('/update', updateCrowdManually);

export default router;
