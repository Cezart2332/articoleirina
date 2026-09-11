import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchArticle, createArticle, updateArticle, uploadImage } from '../api';
import Toast from './Toast';
import { FiArrowLeft, FiUpload, FiCopy, FiSave, FiX, FiFileText, FiImage, FiSettings } from 'react-icons/fi';
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
  Stack,
  Chip,
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
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isEditing && id) loadArticle(id);
  }, [id, isEditing]);

  async function loadArticle(articleId: string) {
    setLoading(true);
    try {
      const data = await fetchArticle(articleId);
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        content: data.content || '',
        excerpt: data.excerpt || '',
        imageUrl: data.imageUrl || '',
        author: data.author || 'Irina Gospodaru',
        category: data.category || 'General',
        published: data.published || false,
      });
    } catch {
      setToast({ message: 'Nu am putut încărca articolul', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[ăâ]/g, 'a')
      .replace(/[î]/g, 'i')
      .replace(/[șş]/g, 's')
      .replace(/[țţ]/g, 't')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm(current => {
      const next = { ...current, [name]: value };
      if (name === 'title' && !isEditing) next.slug = generateSlug(value);
      return next;
    });
  };

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Selectează un fișier imagine', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      const imageUrl = typeof result === 'string' ? result : result.imageUrl;
      if (imageUrl) {
        setForm(current => ({ ...current, imageUrl }));
        setToast({ message: 'Imaginea a fost încărcată', type: 'success' });
      }
    } catch {
      setToast({ message: 'Imaginea nu a putut fi încărcată', type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleImageUpload(file);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }

  async function copyImageUrl() {
    if (!form.imageUrl) return;
    await navigator.clipboard.writeText(form.imageUrl);
    setToast({ message: 'Adresa imaginii a fost copiată', type: 'success' });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.content.trim()) {
      setToast({ message: 'Conținutul este obligatoriu', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isEditing && id) await updateArticle(id, form);
      else await createArticle(form);
      navigate('/');
    } catch {
      setToast({ message: 'Articolul nu a putut fi salvat', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEditing) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, minHeight: '55vh' }}>
        <CircularProgress size={34} />
        <Typography color="text.secondary">Se deschide articolul…</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Button component={Link} to="/" startIcon={<FiArrowLeft />} sx={{ color: 'text.secondary', mb: 2 }}>
        Înapoi la articole
      </Button>

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3.5 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '.14em' }}>
            {isEditing ? 'Editare articol' : 'Conținut nou'}
          </Typography>
          <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '2rem', md: '2.65rem' }, mt: .25 }}>
            {isEditing ? 'Finisează articolul' : 'Scrie un articol'}
          </Typography>
        </Box>
        <Chip
          label={form.published ? 'Pregătit pentru public' : 'Schiță'}
          sx={{ bgcolor: form.published ? '#E5F5EF' : '#FFF3DF', color: form.published ? '#146B4D' : '#91530C', fontWeight: 800, border: '1px solid', borderColor: form.published ? '#BEE6D7' : '#F3D59D' }}
        />
      </Stack>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.75fr) minmax(290px, .75fr)' }, gap: 2.5, alignItems: 'start' }}>
        <Stack spacing={2.5}>
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 2.5 }}>
              <Box sx={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: 'rgba(49,85,217,.08)', color: 'primary.main' }}><FiFileText /></Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Conținut</Typography>
            </Stack>
            <TextField label="Titlu" name="title" value={form.title} onChange={handleChange} fullWidth required autoFocus placeholder="Titlul articolului" />
            <TextField label="Extras" name="excerpt" value={form.excerpt} onChange={handleChange} fullWidth multiline rows={3} sx={{ mt: 2.5 }} helperText="Un rezumat scurt, afișat în liste și previzualizări." />
            <TextField label="Conținut" name="content" value={form.content} onChange={handleChange} fullWidth multiline minRows={16} required sx={{ mt: 2.5 }} placeholder="Începe să scrii aici…" />
          </Paper>

          <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
            <Button component={Link} to="/" color="inherit">Anulează</Button>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress color="inherit" size={16} /> : <FiSave />}>
              {loading ? 'Se salvează…' : isEditing ? 'Salvează modificările' : 'Creează articolul'}
            </Button>
          </Paper>
        </Stack>

        <Stack spacing={2.5}>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: 'rgba(240,100,73,.1)', color: 'secondary.main' }}><FiSettings /></Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Publicare</Typography>
            </Stack>
            <FormControlLabel
              sx={{ mx: 0, width: '100%', justifyContent: 'space-between' }}
              labelPlacement="start"
              control={<Switch checked={form.published} onChange={event => setForm(current => ({ ...current, published: event.target.checked }))} />}
              label={<Box><Typography sx={{ fontWeight: 700 }}>Vizibil pe site</Typography><Typography variant="caption" color="text.secondary">Poți păstra articolul ca schiță.</Typography></Box>}
            />
            <TextField label="Categorie" name="category" value={form.category} onChange={handleChange} fullWidth sx={{ mt: 2.5 }} />
            <TextField label="Autor" name="author" value={form.author} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
            <TextField label="Adresă URL" name="slug" value={form.slug} onChange={handleChange} fullWidth sx={{ mt: 2 }} helperText="Se generează automat din titlu." />
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 2 }}>
              <Box sx={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: 'rgba(27,127,92,.09)', color: 'success.main' }}><FiImage /></Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Imagine principală</Typography>
            </Stack>

            {form.imageUrl ? (
              <Box>
                <Box sx={{ position: 'relative', borderRadius: 2.5, overflow: 'hidden', bgcolor: '#EEF1F6' }}>
                  <Box component="img" src={form.imageUrl} alt="Previzualizarea imaginii principale" sx={{ display: 'block', width: '100%', maxHeight: 260, objectFit: 'cover' }} />
                  <Tooltip title="Elimină imaginea">
                    <IconButton onClick={() => setForm(current => ({ ...current, imageUrl: '' }))} aria-label="Elimină imaginea" size="small" sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,.94)', '&:hover': { bgcolor: 'white' } }}>
                      <FiX />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Button onClick={copyImageUrl} startIcon={<FiCopy />} fullWidth sx={{ mt: 1.25 }}>Copiază adresa imaginii</Button>
              </Box>
            ) : (
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                sx={{ p: 3, border: '1.5px dashed', borderColor: dragging ? 'primary.main' : 'divider', borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', bgcolor: dragging ? 'action.hover' : '#FAFBFD', transition: 'all .2s ease', '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' } }}
              >
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} hidden />
                {uploading ? <CircularProgress size={28} /> : <FiUpload size={27} color="#3155D9" />}
                <Typography sx={{ mt: 1, fontWeight: 700 }}>{uploading ? 'Se încarcă…' : 'Alege o imagine'}</Typography>
                <Typography variant="caption" color="text.secondary">sau trage fișierul aici</Typography>
              </Box>
            )}
          </Paper>
        </Stack>
      </Box>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Box>
  );
}
