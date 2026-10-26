import { Router } from 'express';
import { getAlerts, getAlertById, createAlert, updateAlert, acknowledgeAlert } from '../controllers/alertController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/', getAlerts);
router.get('/:id', getAlertById);
router.post('/', createAlert);
router.patch('/:id', updateAlert);
router.post('/:id/acknowledge', acknowledgeAlert);

export default router;
