const { query, validationResult } = require("express-validator");

const ALLOWED_BANK_CODES = ["WAVE", "ORANGE", "MOOV", "ECOBANK", "BOA", "UBA"];

// Validates ?accountNumber=...&bankCode=... on the name-enquiry GET route.
const nameEnquiryRules = [
  query("accountNumber")
    .trim()
    .notEmpty()
    .withMessage("accountNumber is required")
    .isAlphanumeric()
    .withMessage("accountNumber must be alphanumeric")
    .isLength({ min: 6, max: 20 })
    .withMessage("accountNumber must be between 6 and 20 characters"),

  query("bankCode")
    .trim()
    .notEmpty()
    .withMessage("bankCode is required")
    .toUpperCase()
    .isIn(ALLOWED_BANK_CODES)
    .withMessage(`bankCode must be one of: ${ALLOWED_BANK_CODES.join(", ")}`),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { nameEnquiryRules, handleValidationErrors, ALLOWED_BANK_CODES };
