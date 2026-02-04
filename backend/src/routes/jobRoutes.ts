import express from 'express';
import { createJobRequest, getMyJobRequests, getPartnerLeads, submitQuote } from '../controllers/jobRequestController';
import { authenticateToken, optionalAuthenticate } from '../middleware/auth';

const router = express.Router();

// Consumer Routes
router.post('/', optionalAuthenticate, createJobRequest);
router.get('/my-requests', authenticateToken, getMyJobRequests);

// Partner Routes
router.get('/leads', authenticateToken, getPartnerLeads);
router.post('/leads/:matchId/quote', authenticateToken, submitQuote);

export default router;
