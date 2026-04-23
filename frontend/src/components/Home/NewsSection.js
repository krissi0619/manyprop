import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaNewspaper, FaClock, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './NewsSection.css';

const NewsSection = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await axios.get((process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '') + '/api/news');
                if (res.data && res.data.articles && res.data.articles.length > 0) {
                    setNews(res.data.articles);
                }
            } catch (error) {
                console.error('Failed to fetch news', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    // Fallback images based on property themes
    const placeholderImages = [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    ];

    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now - date;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffHours < 1) return 'Just now';
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return '';
        }
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
        const maxPage = Math.max(0, Math.ceil((news.length - 1) / 3) - 1);
        setCurrentPage(prev => Math.min(maxPage, prev + 1));
    };

    if (loading) {
        return (
            <section className="news-section" id="news-section">
                <div className="container">
                    <div className="news-header">
                        <div className="news-header-left">
                            <FaNewspaper className="news-header-icon" />
                            <h2 className="news-title">
                                <span className="highlight">News and Updates</span> (Latest Blogs)
                            </h2>
                        </div>
                    </div>
                    <div className="news-loading">
                        <div className="news-loading-shimmer"></div>
                        <div className="news-loading-cards">
                            <div className="news-loading-shimmer card"></div>
                            <div className="news-loading-shimmer card"></div>
                            <div className="news-loading-shimmer card"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (news.length === 0) return null;

    const featured = news[0];
    const sideBlogs = news.slice(1, 1 + (currentPage + 1) * 3).slice(currentPage * 3, currentPage * 3 + 3);
    const totalPages = Math.max(1, Math.ceil((news.length - 1) / 3));

    return (
        <section className="news-section" id="news-section">
            <div className="container">
                <div className="news-header">
                    <div className="news-header-left">
                        <FaNewspaper className="news-header-icon" />
                        <h2 className="news-title">
                            <span className="highlight">News and Updates</span> (Latest Blogs)
                        </h2>
                    </div>
                    {totalPages > 1 && (
                        <div className="news-pagination">
                            <button
                                className="news-page-btn"
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                            >
                                <FaChevronLeft />
                            </button>
                            <span className="news-page-info">{currentPage + 1} / {totalPages}</span>
                            <button
                                className="news-page-btn"
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages - 1}
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    )}
                </div>

                <div className="news-layout">
                    {/* Featured large blog */}
                    {featured && (
                        <a href={featured.link} target="_blank" rel="noopener noreferrer" className="news-featured">
                            <div className="featured-image-container">
                                <img
                                    src={featured.imageUrl || placeholderImages[0]}
                                    alt="Featured News"
                                    className="featured-image"
                                    onError={(e) => { e.target.src = placeholderImages[0]; }}
                                />
                                <div className="featured-badge">
                                    <FaNewspaper /> TRENDING
                                </div>
                                <div className="featured-overlay">
                                    <div className="featured-overlay-text">
                                        <span className="featured-date">
                                            <FaClock /> {formatDate(featured.pubDate)}
                                        </span>
                                        <span className="overlay-line1">
                                            {featured.title?.split(' - ')[0] || 'REAL ESTATE MARKET UPDATE'}
                                        </span>
                                        <span className="overlay-line2">
                                            {stripHtml(featured.contentSnippet)?.slice(0, 120)}...
                                        </span>
                                        <span className="featured-read-more">
                                            Read Full Article <FaArrowRight />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    )}

                    {/* Side blog list */}
                    <div className="news-sidebar">
                        {sideBlogs.map((blog, idx) => (
                            <a
                                href={blog.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={`${currentPage}-${idx}`}
                                className="news-card"
                            >
                                <div className="news-card-image">
                                    <img
                                        src={blog.imageUrl || placeholderImages[(idx + 1) % placeholderImages.length]}
                                        alt="News Thumbnail"
                                        onError={(e) => { e.target.src = placeholderImages[(idx + 1) % placeholderImages.length]; }}
                                    />
                                </div>
                                <div className="news-card-content">
                                    <h4 className="news-card-title">{blog.title?.split(' - ')[0]}</h4>
                                    <p className="news-card-excerpt">
                                        {stripHtml(blog.contentSnippet)?.slice(0, 100)}...
                                    </p>
                                    <div className="news-card-meta">
                                        <span className="news-card-date">
                                            <FaClock /> {formatDate(blog.pubDate)}
                                        </span>
                                        <span className="news-card-readmore">
                                            Read more <FaArrowRight />
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
