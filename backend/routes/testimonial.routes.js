const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonial.controller');
router.put('/admin/reply', testimonialController.adminReplyToTestimonial);

// Public routes
router.get('/list', testimonialController.getTestimonials);
router.post('/add', testimonialController.submitTestimonial);
router.get('/admin/list', testimonialController.adminGetAllTestimonials);
router.put('/admin/status', testimonialController.adminUpdateTestimonialStatus);
router.delete('/admin/delete/:id', testimonialController.adminDeleteTestimonial);

module.exports = router;