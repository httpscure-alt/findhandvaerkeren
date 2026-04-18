import { Router } from 'express';
import {
    getPublishedPosts,
    getPostBySlug,
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
} from '../controllers/blogController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// ── Public routes ──────────────────────────────────────────────────
router.get('/', getPublishedPosts);
router.get('/:slug', getPostBySlug);

// ── Admin routes ───────────────────────────────────────────────────
router.get('/admin/posts', authenticate, requireRole('ADMIN'), getAllPosts);
router.post('/admin/posts', authenticate, requireRole('ADMIN'), createPost);
router.put('/admin/posts/:id', authenticate, requireRole('ADMIN'), updatePost);
router.delete('/admin/posts/:id', authenticate, requireRole('ADMIN'), deletePost);

export default router;
