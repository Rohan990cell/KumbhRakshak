import { Router } from 'express';
import { getCCTVList, simulateCameraSurge } from '../controllers/cctvController';

const router = Router();

router.get('/', getCCTVList);
router.post('/:id/simulate', simulateCameraSurge);

export default router;
