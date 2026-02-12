
import express from 'express';
import { authenticate } from '../middleware/auth';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/mark-all-read', authenticate, markAllAsRead);

export default router;
