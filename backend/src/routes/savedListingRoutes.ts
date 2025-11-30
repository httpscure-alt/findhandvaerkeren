import { Router } from 'express';
import {
  getSavedListings,
  saveListing,
  unsaveListing,
} from '../controllers/savedListingController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('CONSUMER'));

router.get('/', getSavedListings);
router.post('/', saveListing);
router.delete('/:companyId', unsaveListing);

export default router;
