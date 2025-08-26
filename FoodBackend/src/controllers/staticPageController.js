import { StaticPage } from '../models/staticPageModel.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validationResult } from 'express-validator';

export const getPageBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page = await StaticPage.findOne({ slug });
  if (!page) {
    throw new ApiError('Not found', 404, 'Page not found');
  }
  return res.status(200).json(new ApiResponse(200, { page }, 'OK'));
});

export const listPages = asyncHandler(async (_req, res) => {
  const pages = await StaticPage.find({}).sort({ updatedAt: -1 });
  return res.status(200).json(new ApiResponse(200, { pages }, 'OK'));
});

export const upsertPage = asyncHandler(async (req, res) => {
  const { slug, title, content, metaTitle, metaDescription, published } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation error', 400, errors.array());
  }
  const doc = await StaticPage.findOneAndUpdate(
    { slug },
    { $set: { title, content, metaTitle, metaDescription, published, updatedBy: req.admin?._id || req.user?._id } },
    { new: true, upsert: true }
  );
  return res.status(200).json(new ApiResponse(200, { page: doc }, 'Saved'));
});

export const getPageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page = await StaticPage.findById(id);
  if (!page) {
    throw new ApiError('Not found', 404, 'Page not found');
  }
  return res.status(200).json(new ApiResponse(200, { page }, 'OK'));
});

export const createPage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation error', 400, errors.array());
  }
  const { slug, title, content, metaTitle, metaDescription, published } = req.body;
  const exists = await StaticPage.findOne({ slug });
  if (exists) {
    throw new ApiError('Conflict', 409, 'Slug already exists');
  }
  const doc = await StaticPage.create({ slug, title, content, metaTitle, metaDescription, published, updatedBy: req.admin?._id });
  return res.status(201).json(new ApiResponse(201, { page: doc }, 'Created'));
});

export const updatePage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation error', 400, errors.array());
  }
  const { id } = req.params;
  const { title, content, metaTitle, metaDescription, published } = req.body;
  const doc = await StaticPage.findByIdAndUpdate(id, { $set: { title, content, metaTitle, metaDescription, published, updatedBy: req.admin?._id } }, { new: true });
  if (!doc) {
    throw new ApiError('Not found', 404, 'Page not found');
  }
  return res.status(200).json(new ApiResponse(200, { page: doc }, 'Updated'));
});

export const deletePage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await StaticPage.findByIdAndDelete(id);
  if (!doc) {
    throw new ApiError('Not found', 404, 'Page not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'Deleted'));
});


