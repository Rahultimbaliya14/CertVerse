const express = require("express");
const router = express.Router(); 

// Import authentication middlewares
const { authenticateTokenCertverse } = require("../middleware/certverseAuth");

// Import controllers
const pdfController = require("../controller/examController");


router.get("/exam/getAllExam",authenticateTokenCertverse, (req, res) => pdfController.getAllExam(req, res));
router.post("/exam/createExam", (req, res) => pdfController.createExam(req, res));
router.put("/exam/updateExam/:id", (req, res) => pdfController.updateExam(req, res));
router.delete("/exam/deleteExam/:id", (req, res) => pdfController.deleteExam(req, res));
router.get("/exam/getExamById/:id", (req, res) => pdfController.getExamById(req, res));
router.post("/exam/suggestion", (req, res) => pdfController.postExamSuggestion(req, res));
module.exports = router;