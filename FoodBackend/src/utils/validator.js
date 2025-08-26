import { check } from 'express-validator';

export const registerValidator = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
    
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),

  check('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),

  // ✅ UPDATED Password Validation
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    .withMessage(
      'Password must include an uppercase letter, a lowercase letter, a number, and a special character'
    ),

  check('acceptTerms')
    .isBoolean()
    .withMessage('Terms acceptance must be a boolean')
    .custom((value) => {
      if (!value) {
        throw new Error('You must accept the Terms & Conditions');
      }
      return true;
    }),
];


export const loginValidator = [
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),

  // ✅ UPDATED Password Validation
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    // Note: The regex check is often removed for login for better UX, 
    // but keeping it for consistency with your original file.
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    .withMessage(
      'Password must include an uppercase letter, a lowercase letter, a number, and a special character'
    ),
];


export const resetPasswordValidator = [
  // ✅ UPDATED Password Validation
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    .withMessage(
      'Password must include an uppercase letter, a lowercase letter, a number, and a special character'
    ),

  // ✅ UPDATED Confirm Password Validation
  check('confirmPassword')
    .notEmpty()
    .withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];


export const forgetPasswordValidator = [
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
];


export const updateUserValidator = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),

  check('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^\d{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
];


export const shopFormValidator = [
  // Required fields
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Shop Name is required')
    .isLength({ min: 2 })
    .withMessage('Shop Name must be at least 2 characters long'),

  check('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2 })
    .withMessage('State must be at least 2 characters long'),

  check('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters long'),

  check('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2 })
    .withMessage('Location must be at least 2 characters long'),

  check('openingHours')
    .trim()
    .notEmpty()
    .withMessage('Opening Hours is required')
    .isLength({ min: 2 })
    .withMessage('Opening Hours must be at least 2 characters long'),

  check('closingHours')
    .trim()
    .notEmpty()
    .withMessage('Closing Hours is required')
    .isLength({ min: 2 })
    .withMessage('Closing Hours must be at least 2 characters long'),

  check('isActive')
    .trim()
    .notEmpty()
    .withMessage('Active is required')
    .isIn(['yes', 'no'])
    .withMessage('Active must be yes or no'),

  // Optional fields (validate if present)
  check('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Description must be at least 2 characters long'),
  check('FSSAI_license')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('FSSAI_license must be at least 2 characters long'),
  check('Eating_house_license')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Eating_house_license must be at least 2 characters long'),
  check('Gst_registration')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Gst_registration must be at least 2 characters long'),
  check('Healt_or_trade_license')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Healt_or_trade_license must be at least 2 characters long'),
  check('Liquior_license')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Liquior_license must be at least 2 characters long'),
  check('Environmental_clearance_license')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Environmental_clearance_license must be at least 2 characters long'),
  check('Fire_safety_license')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Fire_safety_license must be at least 2 characters long'),
  check('Signage_license')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Signage_license must be at least 2 characters long'),
  check('Shop_act')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 1 })
    .withMessage('Shop_act must be provided as a number if present'),
  check('Insurance')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Insurance must be at least 2 characters long'),
  check('contactNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('contactNumber must be at least 2 characters long'),
];

// Products
export const productCreateValidator = [
  check('name').trim().notEmpty().withMessage('Name is required'),
  check('description').trim().notEmpty().withMessage('Description is required'),
  check('price').notEmpty().withMessage('Price is required').isFloat({ gt: 0 }).withMessage('Price must be > 0'),
  check('discount').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discount must be >= 0'),
  check('stock').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Stock must be >= 0'),
];

export const productUpdateValidator = [
  check('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  check('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  check('price').optional().isFloat({ gt: 0 }).withMessage('Price must be > 0'),
  check('discount').optional().isFloat({ min: 0 }).withMessage('Discount must be >= 0'),
  check('stock').optional().isInt({ min: 0 }).withMessage('Stock must be >= 0'),
  check('available').optional().isBoolean().withMessage('available must be boolean'),
];

// Offers
export const offerCreateValidator = [
  // Currently only image optional, no fields enforced
];

export const offerUpdateValidator = [
  // Placeholder for future fields
];

// Orders
export const orderCreateValidator = [
  check('shops').isArray({ min: 1 }).withMessage('shops must be a non-empty array'),
  check('totalQuantity').isInt({ min: 1 }).withMessage('totalQuantity must be >= 1'),
  check('totalPrice').isFloat({ gt: 0 }).withMessage('totalPrice must be > 0'),
  check('deliveryType').optional().isIn(['regular', 'drone']).withMessage('deliveryType invalid'),
];

// Pages
export const pageCreateValidator = [
  check('slug').trim().notEmpty().withMessage('slug is required'),
  check('title').trim().notEmpty().withMessage('title is required'),
  check('content').optional(),
];

export const pageUpdateValidator = [
  check('title').optional().trim().notEmpty().withMessage('title cannot be empty'),
  check('content').optional(),
];