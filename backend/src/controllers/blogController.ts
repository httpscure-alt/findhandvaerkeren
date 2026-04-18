import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

const makeUniqueSlug = async (base: string, excludeId?: string): Promise<string> => {
    let slug = base;
    let counter = 1;
    while (true) {
        const existing = await prisma.blogPost.findUnique({ where: { slug } });
        if (!existing || existing.id === excludeId) break;
        slug = `${base}-${counter++}`;
    }
    return slug;
};

// ─── Public Routes ───────────────────────────────────────────────────────────

// GET /api/blog — list published posts
export const getPublishedPosts = async (req: Request, res: Response) => {
    try {
        const { lang, category, page = '1', limit = '12' } = req.query as Record<string, string>;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where: any = { status: 'published' };
        if (lang) where.lang = lang;
        if (category && category !== 'all') where.category = category;

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip,
                take: parseInt(limit),
                select: {
                    id: true, title: true, slug: true, excerpt: true,
                    coverImageUrl: true, category: true, tags: true,
                    authorName: true, publishedAt: true, lang: true,
                },
            }),
            prisma.blogPost.count({ where }),
        ]);

        res.json({ posts, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        logger.error('Error fetching blog posts:', error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
};

// GET /api/blog/:slug — single post by slug
export const getPostBySlug = async (req: Request, res: Response) => {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { slug: req.params.slug },
        });

        if (!post || post.status !== 'published') {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ post });
    } catch (error) {
        logger.error('Error fetching blog post:', error);
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
};

// ─── Admin Routes ────────────────────────────────────────────────────────────

// GET /api/blog/admin/posts — all posts (admin)
export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where: any = {};
        if (status) where.status = status;

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.blogPost.count({ where }),
        ]);

        res.json({ posts, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        logger.error('Error fetching all blog posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

// POST /api/blog/admin/posts — create
export const createPost = async (req: Request, res: Response) => {
    try {
        const { title, excerpt, content, metaTitle, metaDescription, coverImageUrl, category, tags, status, lang, authorName } = req.body;

        if (!title || !excerpt || !content) {
            return res.status(400).json({ error: 'title, excerpt and content are required' });
        }

        const baseSlug = generateSlug(title);
        const slug = await makeUniqueSlug(baseSlug);

        const post = await prisma.blogPost.create({
            data: {
                title, slug, excerpt, content,
                metaTitle: metaTitle || title,
                metaDescription: metaDescription || excerpt,
                coverImageUrl, category: category || 'general',
                tags: tags || [], status: status || 'draft',
                lang: lang || 'da',
                authorName: authorName || 'Findhåndværkeren',
                publishedAt: status === 'published' ? new Date() : null,
            },
        });

        res.status(201).json({ post });
    } catch (error) {
        logger.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

// PUT /api/blog/admin/posts/:id — update
export const updatePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, excerpt, content, metaTitle, metaDescription, coverImageUrl, category, tags, status, lang, authorName } = req.body;

        const existing = await prisma.blogPost.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Post not found' });

        // If title changed, regenerate slug
        let slug = existing.slug;
        if (title && title !== existing.title) {
            const base = generateSlug(title);
            slug = await makeUniqueSlug(base, id);
        }

        const wasPublished = existing.status === 'published';
        const isNowPublished = status === 'published';

        const post = await prisma.blogPost.update({
            where: { id },
            data: {
                ...(title && { title }),
                slug,
                ...(excerpt && { excerpt }),
                ...(content && { content }),
                metaTitle: metaTitle || title || existing.metaTitle,
                metaDescription: metaDescription || excerpt || existing.metaDescription,
                ...(coverImageUrl !== undefined && { coverImageUrl }),
                ...(category && { category }),
                ...(tags && { tags }),
                ...(status && { status }),
                ...(lang && { lang }),
                ...(authorName && { authorName }),
                publishedAt: isNowPublished && !wasPublished ? new Date() : existing.publishedAt,
            },
        });

        res.json({ post });
    } catch (error) {
        logger.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
};

// DELETE /api/blog/admin/posts/:id — delete
export const deletePost = async (req: Request, res: Response) => {
    try {
        const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ error: 'Post not found' });

        await prisma.blogPost.delete({ where: { id: req.params.id } });
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        logger.error('Error deleting blog post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};
