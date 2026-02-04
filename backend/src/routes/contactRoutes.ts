import { Router } from 'express';
import { submitContactForm } from '../controllers/contactController';

const router = Router();

// Contact form doesn't require authentication
router.post('/', submitContactForm);

export default router;






