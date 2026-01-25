import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { fetchArticles, deleteArticle } from '../api';
import Toast from './Toast';

export default function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch {
      setToast({ message: 'Eroare la încărcarea articolelor', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Ești sigur că vrei să ștergi acest articol?')) return;
    
    try {
      await deleteArticle(id);
      setArticles(articles.filter(a => a.id !== id));
      setToast({ message: 'Articolul a fost șters', type: 'success' });
    } catch {
      setToast({ message: 'Eroare la ștergerea articolului', type: 'error' });
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const groupedArticles = articles.reduce<Record<string, Article[]>>((acc, article) => {
    const category = article.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(article);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedArticles).sort((a, b) => a.localeCompare(b, 'ro'));

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <h1>📝 Admin Articole</h1>
        <div className="header-actions">
          <Link to="/new" className="btn btn-primary">
            ➕ Articol Nou
          </Link>
        </div>
      </header>

      {articles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h3>Niciun articol încă</h3>
          <p>Creează primul articol pentru a începe.</p>
          <Link to="/new" className="btn btn-primary" style={{ marginTop: '20px' }}>
            ➕ Creează Articol
          </Link>
        </div>
      ) : (
        <div className="articles-grid">
          {sortedCategories.map((category) => (
            <div key={category} style={{ gridColumn: '1 / -1' }}>
              <h2 style={{ marginBottom: '12px' }}>{category}</h2>
              <div className="articles-grid">
                {groupedArticles[category]
                  .slice()
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(article => (
                    <div key={article.id} className="article-card">
                      {article.imageUrl ? (
                        <img src={article.imageUrl} alt={article.title} className="article-image" />
                      ) : (
                        <div className="article-image-placeholder">📷</div>
                      )}
                      <div className="article-content">
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                            {article.category || 'General'}
                          </span>
                        </div>
                        <h3 className="article-title">{article.title}</h3>
                        <p className="article-excerpt">
                          {article.excerpt || article.content.substring(0, 100)}...
                        </p>
                        <div className="article-meta">
                          <span>{formatDate(article.createdAt)}</span>
                          <span className={`article-status ${article.published ? 'published' : 'draft'}`}>
                            {article.published ? 'Publicat' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <div className="article-actions">
                        <Link to={`/edit/${article.id}`} className="btn btn-secondary">
                          ✏️ Editează
                        </Link>
                        <button onClick={() => handleDelete(article.id)} className="btn btn-danger">
                          🗑️ Șterge
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
