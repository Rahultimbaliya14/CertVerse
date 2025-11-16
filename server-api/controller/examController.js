const axios = require("axios");
const Exam = require("../models/exam");
const ExamSuggestion = require("../models/examSuggestion");
/**
 * @route GET /api/exam
 * @description Get all exams
 * @returns {Array} Array of exam objects with following fields:
 * @returns {String} _id - MongoDB document ID
 * @returns {String} link - Exam link
 * @returns {String} exam_name - Name of the exam
 * @returns {String} exam_provider - Provider of the exam
 * @returns {String} schedule_url - URL for exam schedule
 * @returns {String} learn_url - URL for learning resources
 * @returns {String} youtube_playlist - YouTube playlist URL
 * @returns {String} description - Exam description
 * @returns {Array<String>} topics_covered - List of topics
 */
exports.getAllExam = async (req, res) => {
    try {
        const exams = await Exam.find()
            .select('_id exam_name exam_provider')
            .sort({ exam_name: 1 });

        if (exams.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No exams found"
            });
        }

        // Group exams by provider
        const groupedExams = exams.reduce((acc, exam) => {
            const provider = exam.exam_provider;
            if (!acc[provider]) {
                acc[provider] = [];
            }
            acc[provider].push(exam);
            return acc;
        }, {});

        // Format the response
        const formattedData = Object.entries(groupedExams).map(([provider, exams]) => ({
            exam_provider: provider,
            exams: exams
        }));

        res.status(200).json({
            status: true,
            data: formattedData
        });

    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({
            status: false,
            message: 'Failed to retrieve exam information',
            error: error.message
        });
    }
};

/**
 * @route POST /api/exam
 * @description Create a new exam
 * @body {Object} exam
 * @body {String} exam.link - Required
 * @body {String} exam.exam_name - Required
 * @body {String} exam.exam_provider - Required
 * @body {String} exam.schedule_url - Optional
 * @body {String} exam.learn_url - Optional
 * @body {String} exam.youtube_playlist - Optional
 * @body {String} exam.description - Optional
 * @body {Array<String>} exam.topics_covered - Optional
 */
exports.createExam = async (req, res) => {
    try {
        const newExam = new Exam(req.body);
        const savedExam = await newExam.save();

        res.status(201).json({
            status: true,
            message: "Exam created successfully",
            data: savedExam
        });
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({
            status: false,
            message: 'Failed to create exam',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/exam/:id
 * @description Update an exam by ID
 * @param {String} id - Exam ID
 * @body {Object} exam - Same fields as create, all optional
 */
exports.updateExam = async (req, res) => {
    try {
        const examId = req.params.id;
        const updatedExam = await Exam.findByIdAndUpdate(
            examId,
            req.body,
            { new: true }
        );

        if (!updatedExam) {
            return res.status(404).json({
                status: false,
                message: "Exam not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Exam updated successfully",
            data: updatedExam
        });
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({
            status: false,
            message: 'Failed to update exam',
            error: error.message
        });
    }
};

/**
 * @route DELETE /api/exam/:id
 * @description Delete an exam by ID
 * @param {String} id - Exam ID
 */
exports.deleteExam = async (req, res) => {
    try {
        const examId = req.params.id;
        const deletedExam = await Exam.findByIdAndDelete(examId);

        if (!deletedExam) {
            return res.status(404).json({
                status: false,
                message: "Exam not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Exam deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({
            status: false,
            message: 'Failed to delete exam',
            error: error.message
        });
    }
};

/**
 * @route GET /api/exam/:id
 * @description Get exam by ID
 * @param {String} id - Exam ID
 * @returns {Object} Exam object
 */
exports.getExamById = async (req, res) => {
    try {
        const examId = req.params.id;
        const exam = await Exam.findById(examId);

        if (!exam) {
            return res.status(404).json({
                status: false,
                message: "Exam not found"
            });
        }

        res.status(200).json({
            status: true,
            data: exam
        });
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({
            status: false,
            message: 'Failed to retrieve exam information',
            error: error.message
        });
    }
};

/**
 * @route POST /api/exam/suggestion
 * @description Create a new exam suggestion
 * @body {Object} suggestion
 * @body {String} suggestion.exam_name - Required
 * @body {String} suggestion.exam_provider - Required
 * @body {String} suggestion.description - Optional
 * @body {String} suggestion.email - Optional
 */
exports.postExamSuggestion = async (req, res) => {
    try {
        const newSuggestion = new ExamSuggestion(req.body);
        const savedSuggestion = await newSuggestion.save();

        res.status(201).json({
            status: true,
            message: "Exam suggestion submitted successfully",
            data: savedSuggestion
        });
    }
    catch (error) {
        console.error('Error creating exam suggestion:', error);
        res.status(500).json({
            status: false,
            message: 'Failed to submit exam suggestion',
            error: error.message
        });
    }
}