const express = require("express");
const router = express.Router();

const { nameEnquiry } = require("../controllers/enquiryController");
const { nameEnquiryRules, handleValidationErrors } = require("../middleware/validate");

// GET /api/name-enquiry
router.get("/name-enquiry", nameEnquiryRules, handleValidationErrors, nameEnquiry);

module.exports = router;
