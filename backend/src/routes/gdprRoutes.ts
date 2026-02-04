import express from 'express';
import { authenticate } from '../middleware/auth';
import { exportUserData, deleteUserAccount } from '../controllers/gdprController';

const router = express.Router();

// All GDPR routes require authentication
router.use(authenticate);

// Export user data
router.get('/export-data', exportUserData);

// Delete user account
router.delete('/delete-account', deleteUserAccount);

export default router;





