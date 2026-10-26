import { Router } from 'express';
import { getNotifications, markAsRead, broadcastNotification } from '../controllers/notificationController';

const router = Router();

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/broadcast', broadcastNotification);

export default router;
