import { Router } from 'express';
import {
    getRecentSearches,
    saveRecentSearch,
    clearRecentSearches
} from '../controllers/recentSearchController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All recent search routes require authentication
router.use(authenticate);

router.get('/', getRecentSearches);
router.post('/', saveRecentSearch);
router.delete('/', clearRecentSearches);

export default router;
