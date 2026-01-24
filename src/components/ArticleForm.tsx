import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Article } from '../types';
import { fetchArticle, createArticle, updateArticle, uploadImage } from '../api';
import Toast from './Toast';

export default function ArticleForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    author: 'Irina Gospodaru',
    published: false
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      loadArticle(id);
    }
  }, [id, isEditing]);

  async function loadArticle(articleId: string) {
    setLoading(true);
    try {
      const article = await fetchArticle(articleId);
      setForm({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        imageUrl: article.imageUrl,
        author: article.author,
        published: article.published
      });
    } catch {
      setToast({ message: 'Eroare la încărcarea articolului', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setForm(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Auto-generate slug from title
      if (name === 'title' && !isEditing) {
        updated.slug = value
          .toLowerCase()
          .replace(/[ăâ]/g, 'a')
          .replace(/[îî]/g, 'i')
          .replace(/[șş]/g, 's')
          .replace(/[țţ]/g, 't')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      }
      
      return updated;
    });
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Doar fișiere imagine sunt permise', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const { imageUrl } = await uploadImage(file);
      setForm(prev => ({ ...prev, imageUrl }));
      setToast({ message: 'Imaginea a fost încărcată', type: 'success' });
    } catch {
      setToast({ message: 'Eroare la încărcarea imaginii', type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }

  function removeImage() {
    setForm(prev => ({ ...prev, imageUrl: '' }));
  }

  function copyImageUrl() {
    navigator.clipboard.writeText(form.imageUrl);
    setToast({ message: 'URL copiat în clipboard', type: 'success' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.title.trim()) {
      setToast({ message: 'Titlul este obligatoriu', type: 'error' });
      return;
    }
    if (!form.content.trim()) {
      setToast({ message: 'Conținutul este obligatoriu', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isEditing && id) {
        await updateArticle(id, form);
        setToast({ message: 'Articolul a fost actualizat', type: 'success' });
      } else {
        await createArticle(form);
        setToast({ message: 'Articolul a fost creat', type: 'success' });
      }
      setTimeout(() => navigate('/'), 1000);
    } catch {
      setToast({ message: 'Eroare la salvarea articolului', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEditing) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <h1>{isEditing ? '✏️ Editează Articol' : '➕ Articol Nou'}</h1>
        <Link to="/" className="btn btn-secondary">
          ← Înapoi
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="title">Titlu *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Titlul articolului"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="slug">Slug (URL)</label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="titlul-articolului"
          />
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Extras (descriere scurtă)</label>
          <input
            type="text"
            id="excerpt"
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            placeholder="O scurtă descriere a articolului"
          />
        </div>

        <div className="form-group">
          <label>Imagine</label>
          <div
            className={`image-upload ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
            />
            <div className="image-upload-icon">📤</div>
            <div className="image-upload-text">
              {uploading ? 'Se încarcă...' : 'Trage o imagine aici sau click pentru a selecta'}
            </div>
          </div>

          {form.imageUrl && (
            <div className="image-preview">
              <img src={form.imageUrl} alt="Preview" />
              <button type="button" className="image-preview-remove" onClick={removeImage}>
                ×
              </button>
              <div className="image-url">
                <input type="text" value={form.imageUrl} readOnly />
                <button type="button" onClick={copyImageUrl}>📋 Copiază</button>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">Conținut *</label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Scrie conținutul articolului aici..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Autor</label>
          <input
            type="text"
            id="author"
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Numele autorului"
          />
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={form.published}
              onChange={handleChange}
            />
            <label htmlFor="published" style={{ marginBottom: 0 }}>
              Publicat (vizibil pe site)
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Se salvează...' : (isEditing ? '💾 Salvează modificările' : '✅ Creează articolul')}
          </button>
          <Link to="/" className="btn btn-secondary">
            Anulează
          </Link>
        </div>
      </form>

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
