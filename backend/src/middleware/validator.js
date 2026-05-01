const { body, validationResult } = require("express-validator");

const validateRegister = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
  body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("phone").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("age").optional().isInt({ min: 0, max: 120 }).withMessage("Invalid age"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

const validateLogin = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

const validateProfileUpdate = [
  body("name").optional().trim().notEmpty().isLength({ max: 50 }),
  body("age").optional().isInt({ min: 0, max: 120 }),
  body("gender").optional().isIn(["male", "female", "other", "prefer_not_to_say"]),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
};
