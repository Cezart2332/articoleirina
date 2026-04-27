import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchArticle, createArticle, updateArticle, uploadImage } from '../api';
import Toast from './Toast';
import { FiEdit2, FiPlus, FiArrowLeft, FiUpload, FiCopy, FiCheck, FiSave, FiX } from 'react-icons/fi';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from '@mui/material';

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
    category: 'General',
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
      const data = await fetchArticle(articleId);
      if (data) {
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          imageUrl: data.imageUrl || '',
          author: data.author || 'Irina Gospodaru',
          category: data.category || 'General',
          published: data.published || false
        });
      }
    } catch {
      setToast({ message: 'Eroare la încărcarea articolului', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[ăâ]/g, 'a')
      .replace(/[îî]/g, 'i')
      .replace(/[șş]/g, 's')
      .replace(/[țţ]/g, 't')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Type assertion fix for switch/checkbox
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setForm(prev => {
      const newForm = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'title' && !isEditing) {
        newForm.slug = generateSlug(value);
      }

      return newForm;
    });
  };

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Doar fișiere imagine sunt permise', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (url && typeof url === 'string') {
        setForm(prev => ({ ...prev, imageUrl: url }));
        setToast({ message: 'Imaginea a fost încărcată', type: 'success' });
      }
    } catch {
      setToast({ message: 'Eroare la încărcarea imaginii', type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  }

  function removeImage() {
    setForm(prev => ({ ...prev, imageUrl: '' }));
  }

  async function copyImageUrl() {
    if (form.imageUrl) {
      await navigator.clipboard.writeText(form.imageUrl);
      setToast({ message: 'URL copiat în clipboard', type: 'success' });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const articleData = { ...form };
      if (!articleData.content) {
        setToast({ message: 'Conținutul este obligatoriu', type: 'error' });
        setLoading(false);
        return;
      }

      if (isEditing && id) {
        await updateArticle(id, articleData);
      } else {
        await createArticle(articleData);
      }
      navigate('/');
    } catch {
      setToast({ message: 'Eroare la salvarea articolului', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEditing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, p: 3, bgcolor: 'rgba(0, 129, 250, 0.06)', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'text.primary' }}>
          {isEditing ? <><FiEdit2 style={{ marginRight: '12px' }} /> Editează Articol</> : <><FiPlus style={{ marginRight: '12px' }} /> Articol Nou</>}
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          color="info"
          startIcon={<FiArrowLeft />}
        >
          Înapoi
        </Button>
      </Box>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }} elevation={0}>
        <TextField
          label="Titlu *"
          name="title"
          value={form.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Slug (URL)"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="titlul-articolului"
        />

        <TextField
          label="Extras (descriere scurtă)"
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={2}
        />

        <TextField
          label="Categorie"
          name="category"
          value={form.category}
          onChange={handleChange}
          fullWidth
          margin="normal"
          placeholder="ex: Dezvoltare Personală"
        />

        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
            Imagine
          </Typography>
          <Box
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: dragging ? 'primary.main' : 'divider',
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: dragging ? 'action.hover' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'info.main'
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <FiUpload size={48} color="#3D5D7A" style={{ marginBottom: 12 }} />
            <Typography color="text.secondary">
              {uploading ? 'Se încarcă...' : 'Trage o imagine aici sau click pentru a selecta'}
            </Typography>
          </Box>

          {form.imageUrl && (
            <Box sx={{ mt: 3, position: 'relative', display: 'inline-block', width: '100%' }}>
              <img 
                src={form.imageUrl} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, display: 'block' }} 
              />
              <Tooltip title="Elimină imaginea" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  aria-label="Elimină imaginea"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'rgba(248, 252, 255, 0.95)',
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                    boxShadow: '0 2px 8px rgba(61, 93, 122, 0.25)',
                    '&:hover': {
                      bgcolor: 'secondary.main',
                      color: 'secondary.contrastText',
                    },
                  }}
                >
                  <FiX size={14} />
                </IconButton>
              </Tooltip>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <TextField
                  value={form.imageUrl}
                  slotProps={{ htmlInput: { readOnly: true } }}
                  size="small"
                  fullWidth
                />
                <Button variant="outlined" color="info" onClick={copyImageUrl} startIcon={<FiCopy />} sx={{ whiteSpace: 'nowrap' }}>
                  Copiază
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <TextField
          label="Conținut *"
          name="content"
          value={form.content}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          minRows={8}
          required
        />

        <TextField
          label="Autor"
          name="author"
          value={form.author}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={form.published} 
                onChange={(e) => setForm({ ...form, published: e.target.checked })} 
                color="secondary" 
              />
            }
            label="Publicat (vizibil pe site)"
          />
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color={isEditing ? 'primary' : 'secondary'}
            disabled={loading}
            startIcon={isEditing ? <FiSave /> : <FiCheck />}
          >
            {loading ? 'Se salvează...' : (isEditing ? 'Salvează modificările' : 'Creează articolul')}
          </Button>
          <Button
            component={Link}
            to="/"
            variant="outlined"
            color="warning"
          >
            Anulează
          </Button>
        </Box>
      </Paper>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Box>
  );
}

