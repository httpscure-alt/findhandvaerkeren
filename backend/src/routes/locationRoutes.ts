import { Router } from 'express';
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getLocations);
router.post('/', authenticate, requireRole('ADMIN'), createLocation);
router.put('/:id', authenticate, requireRole('ADMIN'), updateLocation);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteLocation);

export default router;
