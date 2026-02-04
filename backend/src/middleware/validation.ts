import { body, param, query, ValidationChain } from 'express-validator';

/**
 * Validation rules for company-related endpoints
 */
export const companyValidation = {
    create: [
        body('name').trim().notEmpty().withMessage('Company name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('description').trim().notEmpty().withMessage('Description is required')
            .isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
        body('shortDescription').trim().notEmpty().withMessage('Short description is required')
            .isLength({ min: 10, max: 200 }).withMessage('Short description must be between 10 and 200 characters'),
        body('category').trim().notEmpty().withMessage('Category is required'),
        body('location').trim().notEmpty().withMessage('Location is required'),
        body('contactEmail').isEmail().withMessage('Valid email is required')
            .normalizeEmail(),
        body('website').optional().isURL().withMessage('Valid URL required'),
        body('logoUrl').optional().isURL().withMessage('Valid logo URL required'),
        body('bannerUrl').optional().isURL().withMessage('Valid banner URL required'),
    ],

    update: [
        body('name').optional().trim().isLength({ min: 2, max: 100 }),
        body('description').optional().trim().isLength({ min: 10, max: 5000 }),
        body('shortDescription').optional().trim().isLength({ min: 10, max: 200 }),
        body('contactEmail').optional().isEmail().normalizeEmail(),
        body('website').optional().isURL(),
        body('logoUrl').optional().isURL(),
        body('bannerUrl').optional().isURL(),
    ],
};

/**
 * Validation rules for service endpoints
 */
export const serviceValidation = {
    create: [
        param('companyId').isString().notEmpty(),
        body('title').trim().notEmpty().withMessage('Service title is required')
            .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
        body('description').trim().notEmpty().withMessage('Service description is required')
            .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
    ],

    update: [
        param('companyId').isString().notEmpty(),
        param('serviceId').isString().notEmpty(),
        body('title').optional().trim().isLength({ min: 2, max: 100 }),
        body('description').optional().trim().isLength({ min: 10, max: 2000 }),
    ],

    delete: [
        param('companyId').isString().notEmpty(),
        param('serviceId').isString().notEmpty(),
    ],
};

/**
 * Validation rules for portfolio endpoints
 */
export const portfolioValidation = {
    create: [
        param('companyId').isString().notEmpty(),
        body('title').trim().notEmpty().withMessage('Portfolio title is required')
            .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
        body('imageUrl').isURL().withMessage('Valid image URL is required'),
        body('category').trim().notEmpty().withMessage('Category is required'),
    ],

    update: [
        param('companyId').isString().notEmpty(),
        param('portfolioId').isString().notEmpty(),
        body('title').optional().trim().isLength({ min: 2, max: 100 }),
        body('imageUrl').optional().isURL(),
        body('category').optional().trim().notEmpty(),
    ],

    delete: [
        param('companyId').isString().notEmpty(),
        param('portfolioId').isString().notEmpty(),
    ],
};

/**
 * Validation rules for testimonial endpoints
 */
export const testimonialValidation = {
    create: [
        param('companyId').isString().notEmpty(),
        body('author').trim().notEmpty().withMessage('Author name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Author name must be between 2 and 100 characters'),
        body('role').trim().notEmpty().withMessage('Role is required')
            .isLength({ min: 2, max: 100 }),
        body('company').trim().notEmpty().withMessage('Company is required')
            .isLength({ min: 2, max: 100 }),
        body('content').trim().notEmpty().withMessage('Content is required')
            .isLength({ min: 10, max: 1000 }).withMessage('Content must be between 10 and 1000 characters'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    ],

    update: [
        param('companyId').isString().notEmpty(),
        param('testimonialId').isString().notEmpty(),
        body('author').optional().trim().isLength({ min: 2, max: 100 }),
        body('role').optional().trim().isLength({ min: 2, max: 100 }),
        body('company').optional().trim().isLength({ min: 2, max: 100 }),
        body('content').optional().trim().isLength({ min: 10, max: 1000 }),
        body('rating').optional().isInt({ min: 1, max: 5 }),
    ],

    delete: [
        param('companyId').isString().notEmpty(),
        param('testimonialId').isString().notEmpty(),
    ],
};

/**
 * Validation rules for inquiry endpoints
 */
export const inquiryValidation = {
    create: [
        body('companyId').isString().notEmpty().withMessage('Company ID is required'),
        body('message').trim().notEmpty().withMessage('Message is required')
            .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
    ],

    reply: [
        param('id').isString().notEmpty(),
        body('reply').trim().notEmpty().withMessage('Reply is required')
            .isLength({ min: 10, max: 2000 }).withMessage('Reply must be between 10 and 2000 characters'),
    ],
};

/**
 * Validation rules for contact form
 */
export const contactValidation = {
    submit: [
        body('name').trim().notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('email').isEmail().withMessage('Valid email is required')
            .normalizeEmail(),
        body('subject').trim().notEmpty().withMessage('Subject is required')
            .isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
        body('message').trim().notEmpty().withMessage('Message is required')
            .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
    ],
};

/**
 * Validation rules for auth endpoints
 */
export const authValidation = {
    register: [
        body('email').isEmail().withMessage('Valid email is required')
            .normalizeEmail(),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
        body('name').trim().notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }),
        body('role').optional().isIn(['CONSUMER', 'PARTNER']).withMessage('Invalid role'),
    ],

    login: [
        body('email').isEmail().withMessage('Valid email is required')
            .normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required'),
    ],
};

/**
 * Validation rules for admin endpoints
 */
export const adminValidation = {
    approveVerification: [
        param('id').isString().notEmpty(),
        body('notes').optional().trim().isLength({ max: 1000 }),
    ],

    rejectVerification: [
        param('id').isString().notEmpty(),
        body('reason').trim().notEmpty().withMessage('Rejection reason is required')
            .isLength({ min: 10, max: 1000 }),
    ],

    updateSettings: [
        body('platformName').optional().trim().isLength({ min: 2, max: 100 }),
        body('supportEmail').optional().isEmail().normalizeEmail(),
        body('maintenanceMode').optional().isBoolean(),
    ],
};

/**
 * Validation rules for pagination
 */
export const paginationValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim().isLength({ max: 200 }),
];
