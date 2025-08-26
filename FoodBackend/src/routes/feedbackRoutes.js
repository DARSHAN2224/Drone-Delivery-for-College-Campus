import { Router } from 'express';
import { verifyJWT, verifyAdminJWT } from '../middlewares/authMiddleware.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String },
  email: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
}, { timestamps: true });

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

const router = Router();

// User submits feedback
router.post('/', verifyJWT, async (req, res) => {
  const { subject, message } = req.body || {};
  if (!subject || !message) {
    return res.status(400).json(new ApiResponse(400, null, 'Subject and message are required'));
  }
  const doc = await Feedback.create({
    userId: req.user._id,
    name: req.user.name,
    email: req.user.email,
    subject,
    message,
  });
  return res.status(201).json(new ApiResponse(201, { feedback: doc }, 'Feedback submitted', true));
});

// Admin lists feedback
router.get('/', verifyAdminJWT, async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Feedback.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Feedback.countDocuments(),
  ]);
  return res.status(200).json(new ApiResponse(200, {
    feedback: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }, ''));
});

// Admin updates feedback status: new|read|resolved
router.patch('/:id/status', verifyAdminJWT, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!['new', 'read', 'resolved'].includes(status || '')) {
    return res.status(400).json(new ApiResponse(400, null, 'Invalid status value'));
  }
  const updated = await Feedback.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!updated) {
    return res.status(404).json(new ApiResponse(404, null, 'Feedback not found'));
  }
  return res.status(200).json(new ApiResponse(200, { feedback: updated }, 'Feedback updated', true));
});

export default router;


