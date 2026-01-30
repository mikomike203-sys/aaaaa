'use client';

import { useState, useEffect } from 'react';
import { Book, Search, ChevronRight, HelpCircle, FileText, Zap, Shield, CreditCard, Users, Loader2, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    view_count: number;
    updated_at: string;
}

export default function KnowledgeBasePage() {
    const [data, setData] = useState<{ categories: Category[], featured: Article[] } | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInitial();
    }, []);

    const fetchInitial = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kb');
            const result = await res.json();
            if (result.success) setData(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryArticles = async (category: Category) => {
        setLoading(true);
        setSelectedCategory(category);
        setSelectedArticle(null);
        try {
            const res = await fetch(`/api/kb?categoryId=${category.id}`);
            const result = await res.json();
            if (result.success) setArticles(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetail = async (slug: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/kb?slug=${slug}`);
            const result = await res.json();
            if (result.success) setSelectedArticle(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (name: string) => {
        const icons: Record<string, any> = {
            'getting-started': Zap,
            'billing': CreditCard,
            'security': Shield,
            'commissioners': Users,
            'clients': FileText,
            'default': HelpCircle
        };
        const Icon = icons[name.toLowerCase().replace(' ', '-')] || icons.default;
        return <Icon className="w-6 h-6" />;
    };

    if (loading && !data) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header / Hero */}
            <div className="text-center py-12 space-y-6">
                <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
                    How can we help you today?
                </h1>
                <div className="max-w-2xl mx-auto relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for articles, guides, or keywords..."
                        className="w-full pl-14 pr-8 py-5 bg-[var(--bg-card)] border border-[var(--bg-input)] rounded-3xl shadow-xl shadow-indigo-500/5 outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {selectedArticle ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={() => setSelectedArticle(null)}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to KB
                    </button>
                    <Card className="p-10 border-none shadow-2xl bg-[var(--bg-card)]">
                        <h1 className="text-4xl font-black text-[var(--text-primary)] mb-6">{selectedArticle.title}</h1>
                        <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-10 pb-6 border-b border-[var(--bg-input)]">
                            <span className="bg-indigo-50 px-3 py-1 rounded-full text-indigo-600">Article</span>
                            <span>Updated {new Date(selectedArticle.updated_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{selectedArticle.view_count} Views</span>
                        </div>
                        <div className="prose prose-indigo max-w-none text-[var(--text-secondary)] leading-loose text-lg">
                            {selectedArticle.content || "This article content is coming soon."}
                        </div>
                    </Card>
                </div>
            ) : selectedCategory ? (
                <div className="space-y-8">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> All Categories
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            {getIcon(selectedCategory.name)}
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight">{selectedCategory.name}</h2>
                    </div>
                    <div className="grid gap-4">
                        {articles.length > 0 ? articles.map(article => (
                            <button
                                key={article.id}
                                onClick={() => fetchDetail(article.slug)}
                                className="w-full text-left p-6 bg-[var(--bg-card)] rounded-2xl border border-[var(--bg-input)] hover:border-[var(--primary)] transition-all flex justify-between items-center group shadow-sm hover:shadow-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <FileText className="w-5 h-5 text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
                                    <span className="font-bold text-[var(--text-primary)] text-lg">{article.title}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-all" />
                            </button>
                        )) : (
                            <p className="text-center py-10 text-[var(--text-secondary)]">No articles in this category yet.</p>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Categories Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {data?.categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => fetchCategoryArticles(cat)}
                                className="p-8 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--bg-input)] shadow-xl shadow-indigo-500/5 hover:border-[var(--primary)] hover:translate-y-[-8px] transition-all duration-300 text-center flex flex-col items-center gap-4"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                    {getIcon(cat.name)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-tight">{cat.name}</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Browse guides and common questions.</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Featured / Popular */}
                    <div className="pt-12">
                        <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8 flex items-center gap-3">
                            <Book className="w-6 h-6 text-[var(--primary)]" />
                            Popular Guides
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {data?.featured.map((article) => (
                                <Card
                                    key={article.id}
                                    className="p-6 bg-gradient-to-r from-gray-50 to-white hover:from-white border-[var(--bg-input)] cursor-pointer hover:shadow-xl transition-all flex items-start gap-4"
                                    onClick={() => fetchDetail(article.slug)}
                                >
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                        <FileText className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--text-primary)]">{article.title}</h3>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1 font-bold">
                                            {article.view_count} people found this useful
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Support CTA */}
            <Card className="p-12 bg-white rounded-[3rem] border border-indigo-100 text-center space-y-6 shadow-2xl flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-10 h-10 text-indigo-600" />
                </div>
                <div className="max-w-xl">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Still need help?</h2>
                    <p className="text-gray-500 text-lg">
                        Can't find what you're looking for? Our dedicated support team is here to assist you 24/7 with any questions or technical issues.
                    </p>
                </div>
                <button className="px-10 py-5 bg-[#5347CE] text-white rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-200">
                    Contact Support Team
                </button>
            </Card>
        </div>
    );
}
