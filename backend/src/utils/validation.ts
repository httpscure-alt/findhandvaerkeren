import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors for better frontend handling
    const formattedErrors = errors.array().map(err => {
      const field = err.type === 'field' ? err.path : 'unknown';
      let message = err.msg;
      
      // Provide more specific error messages
      if (field === 'email') {
        message = 'Please enter a valid email address';
      } else if (field === 'password') {
        if (err.msg.includes('length')) {
          message = 'Password must be at least 6 characters long';
        } else {
          message = 'Password is required';
        }
      } else if (field === 'name' || field === 'firstName' || field === 'lastName') {
        message = `${field} cannot be empty`;
      } else if (field === 'role') {
        message = 'Role must be either CONSUMER or PARTNER';
      }
      
      return { field, message };
    });

    // Return first error message for simpler frontend handling
    const firstError = formattedErrors[0];
    res.status(400).json({ 
      error: firstError.message || 'Validation failed',
      errors: formattedErrors // Also include all errors for detailed feedback
    });
  };
};

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').optional().trim().notEmpty(),
  body('companyName').optional().trim().notEmpty(), // For partner registration
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('role').optional().isIn(['CONSUMER', 'PARTNER']),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const companyValidation = [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('shortDescription').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('contactEmail').isEmail().normalizeEmail(),
  body('website').optional().isURL(),
  body('tags').optional().isArray(),
];
