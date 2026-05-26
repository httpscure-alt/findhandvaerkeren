import { Router } from 'express';
import {
  getPublishedPosts,
  getPostBySlug,
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  getBlogSitemap,
} from '../controllers/blogController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

const requireBlogAdmin = [authenticate, requireRole('ADMIN')];

// ── Admin routes (before /:slug) ───────────────────────────────────────────
router.get('/admin/posts', ...requireBlogAdmin, getAllPosts);
router.post('/admin/posts', ...requireBlogAdmin, createPost);
router.put('/admin/posts/:id', ...requireBlogAdmin, updatePost);
router.delete('/admin/posts/:id', ...requireBlogAdmin, deletePost);

// ── SEO / sitemap ───────────────────────────────────────────────────────────
router.get('/sitemap.xml', getBlogSitemap);

// ── Public routes ───────────────────────────────────────────────────────────
router.get('/', getPublishedPosts);
router.get('/:slug', getPostBySlug);

export default router;
