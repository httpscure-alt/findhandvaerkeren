import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').optional().trim().notEmpty(),
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
