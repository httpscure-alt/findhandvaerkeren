import React from 'react';
import { Language } from '../../../types';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogPageProps {
  lang: Language;
}

const BlogPage: React.FC<BlogPageProps> = ({ lang }) => {
  const blogPosts = [
    {
      id: 1,
      title: lang === 'da' 
        ? 'Sådan Vælger Du Den Rigtige B2B Partner'
        : 'How to Choose the Right B2B Partner',
      excerpt: lang === 'da'
        ? 'En guide til at finde den perfekte partner til din virksomhed.'
        : 'A guide to finding the perfect partner for your business.',
      author: 'Admin',
      date: '2024-01-15',
      image: 'https://picsum.photos/id/1/600/400'
    },
    {
      id: 2,
      title: lang === 'da'
        ? 'Fordele Ved Verificerede Partnere'
        : 'Benefits of Verified Partners',
      excerpt: lang === 'da'
        ? 'Hvorfor verificering betyder alt i B2B-markedet.'
        : 'Why verification matters in the B2B marketplace.',
      author: 'Admin',
      date: '2024-01-10',
      image: 'https://picsum.photos/id/2/600/400'
    },
    {
      id: 3,
      title: lang === 'da'
        ? 'AI-Søgning: Fremtiden For B2B'
        : 'AI Search: The Future of B2B',
      excerpt: lang === 'da'
        ? 'Opdag hvordan AI transformerer måden vi finder partnere på.'
        : 'Discover how AI is transforming how we find partners.',
      author: 'Admin',
      date: '2024-01-05',
      image: 'https://picsum.photos/id/3/600/400'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[#1D1D1F] mb-4">
          {lang === 'da' ? 'Blog' : 'Blog'}
        </h1>
        <p className="text-xl text-nexus-subtext max-w-2xl mx-auto">
          {lang === 'da'
            ? 'Nyheder, tips og indsigt fra B2B-markedet'
            : 'News, tips, and insights from the B2B marketplace'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 text-xs text-nexus-subtext mb-4">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  {post.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {post.date}
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#1D1D1F] mb-2 group-hover:text-nexus-accent transition-colors">
                {post.title}
              </h3>
              <p className="text-nexus-subtext mb-4 line-clamp-2">{post.excerpt}</p>
              <button className="text-sm font-medium text-nexus-accent hover:underline flex items-center gap-1">
                {lang === 'da' ? 'Læs Mere' : 'Read More'} <ArrowRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-nexus-subtext mb-4">
          {lang === 'da' ? 'Flere artikler kommer snart...' : 'More articles coming soon...'}
        </p>
      </div>
    </div>
  );
};

export default BlogPage;
