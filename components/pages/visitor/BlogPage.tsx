import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ArrowRight, Search, Loader2, BookOpen } from 'lucide-react';
import { Language } from '../../../types';
import { useSEO } from '../../../hooks/useSEO';
import { api } from '../../../services/api';

interface BlogPageProps {
    lang: Language;
}

const CATEGORIES = [
    { key: 'all', da: 'Alle', en: 'All' },
    { key: 'priser', da: 'Priser', en: 'Prices' },
    { key: 'google-ads', da: 'Google Ads', en: 'Google Ads' },
    { key: 'seo', da: 'SEO', en: 'SEO' },
    { key: 'tips', da: 'Tips & Guides', en: 'Tips & Guides' },
    { key: 'general', da: 'Generelt', en: 'General' },
];

const BlogPage: React.FC<BlogPageProps> = ({ lang }) => {
    const navigate = useNavigate();
    const isDa = lang === 'da';

    useSEO({
        title: isDa ? 'Blog – Guides & Tips til Håndværkere | Findhåndværkeren' : 'Blog – Guides & Tips for Craftsmen | Findhåndværkeren',
        description: isDa
            ? 'Læs vores artikler om priser, Google Ads, SEO og tips til din håndværkervirksomhed.'
            : 'Read our articles on pricing, Google Ads, SEO and tips for your trade business.',
        canonical: 'https://findhandvaerkeren.dk/blog',
    });

    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await api.getBlogPosts({ lang, category: activeCategory === 'all' ? undefined : activeCategory });
                setPosts(data.posts || []);
            } catch {
                setPosts([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [lang, activeCategory]);

    const filtered = posts.filter(p =>
        !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="bg-gray-50 border-b border-gray-100 py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1D1D1F]/5 rounded-full text-[#1D1D1F] text-xs font-bold uppercase tracking-wider mb-6">
                        <BookOpen size={14} /> {isDa ? 'Viden & inspiration' : 'Knowledge & inspiration'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#1D1D1F] mb-4 tracking-tight">
                        {isDa ? 'Blog & Guides' : 'Blog & Guides'}
                    </h1>
                    <p className="text-lg text-[#86868B] font-medium mb-8">
                        {isDa
                            ? 'Priser, tips og strategier – alt hvad du behøver som håndværker i Danmark.'
                            : 'Prices, tips and strategies – everything you need as a craftsman in Denmark.'}
                    </p>
                    {/* Search */}
                    <div className="relative max-w-md mx-auto">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
                        <input
                            type="text"
                            placeholder={isDa ? 'Søg i artikler...' : 'Search articles...'}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/10 bg-white text-sm"
                        />
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Category filter */}
                <div className="flex flex-wrap gap-2 mb-10 justify-center">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                activeCategory === cat.key
                                    ? 'bg-[#1D1D1F] text-white'
                                    : 'bg-gray-100 text-[#86868B] hover:bg-gray-200'
                            }`}
                        >
                            {isDa ? cat.da : cat.en}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 size={32} className="animate-spin text-[#86868B]" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-[#86868B]">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">
                            {isDa ? 'Ingen artikler fundet' : 'No articles found'}
                        </p>
                        <p className="text-sm mt-2">
                            {isDa ? 'Prøv en anden kategori eller søgning.' : 'Try a different category or search.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map(post => (
                            <article
                                key={post.id}
                                onClick={() => navigate(`/blog/${post.slug}`)}
                                className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                            >
                                {post.coverImageUrl ? (
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={post.coverImageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                        <BookOpen size={40} className="text-gray-300" />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-center gap-3 text-xs text-[#86868B] mb-3">
                                        <span className="flex items-center gap-1">
                                            <User size={12} /> {post.authorName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} /> {new Date(post.publishedAt).toLocaleDateString(isDa ? 'da-DK' : 'en-GB')}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-[#1D1D1F] mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-[#86868B] line-clamp-3 mb-4">{post.excerpt}</p>
                                    {post.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {post.tags.slice(0, 3).map((tag: string) => (
                                                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-[#86868B] font-medium">
                                                    <Tag size={9} /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <span className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1 group-hover:gap-2 transition-all">
                                        {isDa ? 'Læs artikel' : 'Read article'} <ArrowRight size={14} />
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
