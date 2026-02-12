import { Router } from 'express';
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  verifyCompany,
  getPerformanceMetrics,
  updatePerformanceMetrics,
  addOptimizationLog,
} from '../controllers/companyController';
import {
  getCompanyServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController';
import {
  getCompanyPortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from '../controllers/portfolioController';
import {
  getCompanyTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, companyValidation } from '../utils/validation';

const router = Router();

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', authenticate, requireRole('PARTNER'), validate(companyValidation), createCompany);
router.put('/:id', authenticate, validate(companyValidation), updateCompany);
router.delete('/:id', authenticate, deleteCompany);
router.patch('/:id/verify', authenticate, requireRole('ADMIN'), verifyCompany);

// Growth / Performance Metrics
router.get('/:companyId/performance', authenticate, getPerformanceMetrics);
router.put('/:companyId/performance', authenticate, requireRole('ADMIN'), updatePerformanceMetrics);
router.post('/:companyId/optimization-logs', authenticate, requireRole('ADMIN'), addOptimizationLog);

// Services routes
router.get('/:companyId/services', getCompanyServices);
router.post('/:companyId/services', authenticate, requireRole('PARTNER'), createService);
router.put('/:companyId/services/:serviceId', authenticate, requireRole('PARTNER'), updateService);
router.delete('/:companyId/services/:serviceId', authenticate, requireRole('PARTNER'), deleteService);

// Portfolio routes
router.get('/:companyId/portfolio', getCompanyPortfolio);
router.post('/:companyId/portfolio', authenticate, requireRole('PARTNER'), createPortfolioItem);
router.put('/:companyId/portfolio/:portfolioId', authenticate, requireRole('PARTNER'), updatePortfolioItem);
router.delete('/:companyId/portfolio/:portfolioId', authenticate, requireRole('PARTNER'), deletePortfolioItem);

// Testimonials routes
router.get('/:companyId/testimonials', getCompanyTestimonials);
router.post('/:companyId/testimonials', authenticate, createTestimonial);
router.put('/:companyId/testimonials/:testimonialId', authenticate, updateTestimonial);
router.delete('/:companyId/testimonials/:testimonialId', authenticate, deleteTestimonial);

export default router;
