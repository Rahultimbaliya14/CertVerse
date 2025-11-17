const express = require("express");
const router = express.Router(); 

// Import authentication middlewares
const { authenticateTokenCertverse } = require("../middleware/certverseAuth");
const { adminAuth } = require("../middleware/adminAuth");

// Import controllers
const pdfController = require("../controller/examController");

// Public routes with authentication
router.get("/exam/getAllExam", authenticateTokenCertverse, (req, res) => pdfController.getAllExam(req, res));
router.get("/exam/getExamById/:id", authenticateTokenCertverse, (req, res) => pdfController.getExamById(req, res));
router.post("/exam/suggestion", authenticateTokenCertverse, (req, res) => pdfController.postExamSuggestion(req, res));

// Admin protected routes
router.post("/exam/createExam", adminAuth, (req, res) => pdfController.createExam(req, res));
router.put("/exam/updateExam/:id", adminAuth, (req, res) => pdfController.updateExam(req, res));
router.delete("/exam/deleteExam/:id", adminAuth, (req, res) => pdfController.deleteExam(req, res));

module.exports = router;