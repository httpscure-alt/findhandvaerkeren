import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Edit3, Trash2, Eye, EyeOff, Loader2, Save,
    ArrowLeft, CheckCircle, Tag, X, Image, Globe, BookOpen
} from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

const CATEGORIES = ['general', 'priser', 'google-ads', 'seo', 'tips'];

const emptyForm = {
    title: '',
    excerpt: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    coverImageUrl: '',
    category: 'general',
    tags: [] as string[],
    status: 'draft',
    lang: 'da',
    authorName: 'Findhåndværkeren',
};

const BlogManagementPage: React.FC = () => {
    const toast = useToast();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingPost, setEditingPost] = useState<any | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await api.adminGetAllBlogPosts();
            setPosts(data.posts || []);
        } catch {
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const openNew = () => {
        setEditingPost(null);
        setForm({ ...emptyForm });
        setView('editor');
    };

    const openEdit = (post: any) => {
        setEditingPost(post);
        setForm({
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            metaTitle: post.metaTitle || '',
            metaDescription: post.metaDescription || '',
            coverImageUrl: post.coverImageUrl || '',
            category: post.category,
            tags: post.tags || [],
            status: post.status,
            lang: post.lang,
            authorName: post.authorName,
        });
        setView('editor');
    };

    const handleSave = async (publishNow = false) => {
        if (!form.title || !form.excerpt || !form.content) {
            toast.error('Title, excerpt and content are required');
            return;
        }
        setSaving(true);
        const payload = { ...form, status: publishNow ? 'published' : form.status };
        try {
            if (editingPost) {
                await api.adminUpdateBlogPost(editingPost.id, payload);
                toast.success('Post updated!');
            } else {
                await api.adminCreateBlogPost(payload);
                toast.success('Post created!');
            }
            setView('list');
            fetchPosts();
        } catch (e: any) {
            toast.error(e.message || 'Failed to save post');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            await api.adminDeleteBlogPost(id);
            toast.success('Post deleted');
            fetchPosts();
        } catch {
            toast.error('Failed to delete post');
        }
    };

    const handleToggleStatus = async (post: any) => {
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        try {
            await api.adminUpdateBlogPost(post.id, { status: newStatus });
            toast.success(`Post ${newStatus === 'published' ? 'published' : 'set to draft'}`);
            fetchPosts();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const addTag = () => {
        const t = tagInput.trim().toLowerCase();
        if (t && !form.tags.includes(t)) {
            setForm(f => ({ ...f, tags: [...f.tags, t] }));
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

    // Markdown toolbar helper
    const insertMarkdown = (before: string, after: string = '') => {
        const ta = textAreaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = form.content.substring(start, end);
        const newContent = form.content.substring(0, start) + before + selected + after + form.content.substring(end);
        setForm(f => ({ ...f, content: newContent }));
        setTimeout(() => { ta.selectionStart = start + before.length; ta.selectionEnd = start + before.length + selected.length; ta.focus(); }, 0);
    };

    // ── LIST VIEW ─────────────────────────────────────────────────────────────
    if (view === 'list') {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1D1D1F]">Blog Management</h1>
                        <p className="text-[#86868B] text-sm mt-1">{posts.length} total posts</p>
                    </div>
                    <button
                        onClick={openNew}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1D1D1F] text-white rounded-xl font-bold hover:bg-black transition-all"
                    >
                        <Plus size={16} /> New Article
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24"><Loader2 size={32} className="animate-spin text-[#86868B]" /></div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-[#86868B] font-medium mb-4">No articles yet. Create your first one!</p>
                        <button onClick={openNew} className="px-6 py-3 bg-[#1D1D1F] text-white rounded-xl font-bold hover:bg-black">
                            Write First Article
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.map(post => (
                            <div key={post.id} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-all">
                                {post.coverImageUrl ? (
                                    <img src={post.coverImageUrl} alt={post.title} className="w-16 h-12 object-cover rounded-xl flex-shrink-0" />
                                ) : (
                                    <div className="w-16 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <BookOpen size={18} className="text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-[#1D1D1F] truncate">{post.title}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                            post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {post.status.toUpperCase()}
                                        </span>
                                        <span className="text-[10px] font-mono text-[#86868B] bg-gray-50 px-2 py-0.5 rounded-full flex-shrink-0">
                                            {post.lang.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#86868B] truncate">{post.excerpt}</p>
                                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                                        <span>{post.category}</span>
                                        <span>·</span>
                                        <span>{new Date(post.createdAt).toLocaleDateString('da-DK')}</span>
                                        {post.publishedAt && <><span>·</span><span>Published {new Date(post.publishedAt).toLocaleDateString('da-DK')}</span></>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleToggleStatus(post)}
                                        title={post.status === 'published' ? 'Set to draft' : 'Publish'}
                                        className="p-2 rounded-xl hover:bg-gray-100 text-[#86868B] transition-all"
                                    >
                                        {post.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button onClick={() => openEdit(post)} className="p-2 rounded-xl hover:bg-gray-100 text-[#86868B] transition-all">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(post.id, post.title)} className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── EDITOR VIEW ───────────────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors text-sm font-medium">
                    <ArrowLeft size={16} /> Back to posts
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#1D1D1F] rounded-xl font-bold hover:bg-gray-200 transition-all text-sm disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-[#1D1D1F] text-white rounded-xl font-bold hover:bg-black transition-all text-sm disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Publish
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main editor */}
                <div className="lg:col-span-2 space-y-4">
                    <input
                        type="text"
                        placeholder="Article title..."
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full text-3xl font-extrabold text-[#1D1D1F] placeholder-gray-300 border-0 border-b-2 border-gray-100 focus:outline-none focus:border-[#1D1D1F] pb-3 bg-transparent transition-colors"
                    />
                    <textarea
                        placeholder="Short excerpt (shown in blog list and used as meta description)..."
                        value={form.excerpt}
                        onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                        rows={2}
                        className="w-full text-base text-[#86868B] placeholder-gray-300 border border-gray-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/10 resize-none"
                    />

                    {/* Markdown toolbar */}
                    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-xl border border-gray-100">
                        {[
                            { label: 'H2', action: () => insertMarkdown('## ') },
                            { label: 'H3', action: () => insertMarkdown('### ') },
                            { label: 'Bold', action: () => insertMarkdown('**', '**') },
                            { label: 'Italic', action: () => insertMarkdown('*', '*') },
                            { label: 'List', action: () => insertMarkdown('- ') },
                            { label: 'Quote', action: () => insertMarkdown('> ') },
                            { label: 'Code', action: () => insertMarkdown('`', '`') },
                            { label: 'Link', action: () => insertMarkdown('[', '](url)') },
                        ].map(btn => (
                            <button key={btn.label} onClick={btn.action} className="px-3 py-1.5 text-xs font-bold text-[#86868B] hover:bg-white hover:text-[#1D1D1F] rounded-lg transition-all border border-transparent hover:border-gray-200">
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <textarea
                        ref={textAreaRef}
                        placeholder="Write your article in Markdown...&#10;&#10;## Section heading&#10;&#10;Your paragraph text here.&#10;&#10;- Bullet point one&#10;- Bullet point two"
                        value={form.content}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        rows={22}
                        className="w-full font-mono text-sm text-[#1D1D1F] placeholder-gray-300 border border-gray-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/10 resize-none leading-relaxed"
                    />
                </div>

                {/* Sidebar settings */}
                <div className="space-y-4">
                    {/* Status */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                        <h3 className="font-bold text-[#1D1D1F] text-sm">Settings</h3>

                        <div>
                            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Status</label>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                className="w-full mt-1 px-3 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Language</label>
                            <select value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value }))}
                                className="w-full mt-1 px-3 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none">
                                <option value="da">🇩🇰 Danish</option>
                                <option value="en">🇬🇧 English</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Category</label>
                            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                className="w-full mt-1 px-3 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Author</label>
                            <input type="text" value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                                className="w-full mt-1 px-3 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none" />
                        </div>
                    </div>

                    {/* Cover image */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                        <h3 className="font-bold text-[#1D1D1F] text-sm flex items-center gap-2"><Image size={14} /> Cover Image</h3>
                        <input type="url" placeholder="https://..." value={form.coverImageUrl}
                            onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none" />
                        {form.coverImageUrl && (
                            <img src={form.coverImageUrl} alt="Cover preview" className="w-full h-32 object-cover rounded-xl" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        )}
                    </div>

                    {/* Tags */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                        <h3 className="font-bold text-[#1D1D1F] text-sm flex items-center gap-2"><Tag size={14} /> Tags</h3>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Add tag..." value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                className="flex-1 px-3 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none" />
                            <button onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {form.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-[#86868B] rounded-full text-xs font-medium">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                        <h3 className="font-bold text-[#1D1D1F] text-sm flex items-center gap-2"><Globe size={14} /> SEO (optional)</h3>
                        <div>
                            <label className="text-xs text-[#86868B] font-medium">Meta Title</label>
                            <input type="text" placeholder="Defaults to article title" value={form.metaTitle}
                                onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                                className="w-full mt-1 px-3 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none" />
                            <p className="text-[10px] text-gray-400 mt-1">{form.metaTitle.length}/60 chars</p>
                        </div>
                        <div>
                            <label className="text-xs text-[#86868B] font-medium">Meta Description</label>
                            <textarea rows={3} placeholder="Defaults to excerpt" value={form.metaDescription}
                                onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                                className="w-full mt-1 px-3 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none resize-none" />
                            <p className="text-[10px] text-gray-400 mt-1">{form.metaDescription.length}/160 chars</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogManagementPage;
