import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { Language } from '../../../types';
import { useSEO } from '../../../hooks/useSEO';
import { api } from '../../../services/api';

interface BlogPostPageProps {
    lang: Language;
}

// Very simple markdown-like renderer (no external deps)
const renderContent = (content: string): string => {
    return content
        // Headers
        .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-[#1D1D1F] mt-8 mb-3">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-[#1D1D1F] mt-10 mb-4">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-[#1D1D1F] mt-10 mb-4">$1</h1>')
        // Bold & italic
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-[#1D1D1F]">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
        // Unordered list items
        .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 mb-1"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1D1D1F] flex-shrink-0"></span><span>$1</span></li>')
        // Wrap consecutive li in ul
        .replace(/(<li .+<\/li>\n?)+/g, m => `<ul class="my-4 space-y-1">${m}</ul>`)
        // Blockquote
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-200 pl-4 italic text-[#86868B] my-4">$1</blockquote>')
        // Inline code
        .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-[#1D1D1F]">$1</code>')
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener">$1</a>')
        // Paragraphs (double newlines)
        .replace(/\n\n(?!<)/g, '</p><p class="mb-4 text-[#1D1D1F] leading-relaxed">')
        // Wrap in outer paragraph
        .replace(/^(?!<)/, '<p class="mb-4 text-[#1D1D1F] leading-relaxed">')
        .replace(/(?<!>)$/, '</p>');
};

const BlogPostPage: React.FC<BlogPostPageProps> = ({ lang }) => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const isDa = lang === 'da';

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useSEO({
        title: post
            ? `${post.metaTitle || post.title} | Findhåndværkeren`
            : isDa ? 'Artikel | Findhåndværkeren' : 'Article | Findhåndværkeren',
        description: post?.metaDescription || post?.excerpt || '',
        canonical: `https://findhandvaerkeren.dk/blog/${slug}`,
        ogImage: post?.coverImageUrl,
        ogType: 'article',
    });

    useEffect(() => {
        if (!slug) return;
        (async () => {
            setLoading(true);
            try {
                const data = await api.getBlogPost(slug);
                setPost(data.post);
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 size={36} className="animate-spin text-[#86868B]" />
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2">
                    {isDa ? 'Artikel ikke fundet' : 'Article not found'}
                </h1>
                <p className="text-[#86868B] mb-8">
                    {isDa ? 'Denne artikel eksisterer ikke eller er ikke publiceret endnu.' : 'This article does not exist or is not published yet.'}
                </p>
                <button onClick={() => navigate('/blog')} className="px-6 py-3 bg-[#1D1D1F] text-white rounded-xl font-bold hover:bg-black transition-all">
                    {isDa ? 'Gå til blog' : 'Go to blog'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Cover Image */}
            {post.coverImageUrl && (
                <div className="w-full h-64 md:h-96 overflow-hidden">
                    <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                {/* Back */}
                <button
                    onClick={() => navigate('/blog')}
                    className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-8 text-sm font-medium"
                >
                    <ArrowLeft size={16} /> {isDa ? 'Tilbage til blog' : 'Back to blog'}
                </button>

                {/* Category pill */}
                <div className="mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-[#86868B] text-xs font-bold rounded-full uppercase tracking-wide">
                        {post.category}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1D1D1F] mb-4 leading-tight tracking-tight">
                    {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#86868B] mb-8 pb-8 border-b border-gray-100">
                    <span className="flex items-center gap-1.5">
                        <User size={14} /> {post.authorName}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(post.publishedAt).toLocaleDateString(isDa ? 'da-DK' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-[11px] font-medium">
                                    <Tag size={9} /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Excerpt / Lead */}
                <p className="text-xl text-[#86868B] leading-relaxed mb-8 font-medium">
                    {post.excerpt}
                </p>

                {/* Content */}
                <div
                    className="prose prose-lg max-w-none text-[#1D1D1F]"
                    dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
                />

                {/* CTA */}
                <div className="mt-16 p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                    <h3 className="text-xl font-bold text-[#1D1D1F] mb-3">
                        {isDa ? 'Klar til at vækste din virksomhed?' : 'Ready to grow your business?'}
                    </h3>
                    <p className="text-[#86868B] mb-6 text-sm">
                        {isDa ? 'Se vores marketing tjenester for håndværkere.' : 'See our marketing services for craftsmen.'}
                    </p>
                    <button
                        onClick={() => navigate('/marketing')}
                        className="px-8 py-3 bg-[#1D1D1F] text-white rounded-xl font-bold hover:bg-black transition-all"
                    >
                        {isDa ? 'Se vores tjenester' : 'View our services'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlogPostPage;
