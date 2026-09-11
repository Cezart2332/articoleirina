import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { fetchArticles, deleteArticle } from '../api';
import Toast from './Toast';
import { FiEdit2, FiPlus, FiTrash2, FiFileText, FiImage, FiLayers, FiCheckCircle, FiClock } from 'react-icons/fi';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  Paper,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';

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
      setToast({ message: 'Nu am putut încărca articolele', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Ești sigură că vrei să ștergi acest articol?')) return;

    try {
      await deleteArticle(id);
      setArticles(current => current.filter(article => article.id !== id));
      setToast({ message: 'Articolul a fost șters', type: 'success' });
    } catch {
      setToast({ message: 'Articolul nu a putut fi șters', type: 'error' });
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  const groupedArticles = articles.reduce<Record<string, Article[]>>((acc, article) => {
    const category = article.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(article);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedArticles).sort((a, b) => a.localeCompare(b, 'ro'));
  const publishedCount = articles.filter(article => article.published).length;
  const draftCount = articles.length - publishedCount;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, minHeight: '55vh' }}>
        <CircularProgress size={34} />
        <Typography color="text.secondary">Se pregătește biblioteca…</Typography>
      </Box>
    );
  }

  const stats = [
    { label: 'Total articole', value: articles.length, icon: <FiFileText />, color: '#3155D9' },
    { label: 'Publicate', value: publishedCount, icon: <FiCheckCircle />, color: '#1B7F5C' },
    { label: 'În lucru', value: draftCount, icon: <FiClock />, color: '#B56A16' },
    { label: 'Categorii', value: sortedCategories.length, icon: <FiLayers />, color: '#F06449' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-end', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3.5 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '.14em' }}>
            Biblioteca editorială
          </Typography>
          <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '2rem', md: '2.7rem' }, mt: .25 }}>
            Articolele tale
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Tot conținutul, organizat într-un singur loc.
          </Typography>
        </Box>
        <Button component={Link} to="/new" variant="contained" startIcon={<FiPlus />} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
          Nou
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: { xs: 4, md: 5 } }}>
        {stats.map(stat => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: { xs: '1.65rem', md: '2rem' }, lineHeight: 1, fontWeight: 800, letterSpacing: '-.04em' }}>{stat.value}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: 12, md: 14 }, mt: .75 }}>{stat.label}</Typography>
                </Box>
                <Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 2.5, color: stat.color, bgcolor: `${stat.color}12`, fontSize: 19 }}>
                  {stat.icon}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {articles.length === 0 ? (
        <Paper sx={{ p: { xs: 4, md: 7 }, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }} elevation={0}>
          <Box sx={{ width: 64, height: 64, mx: 'auto', borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: 'rgba(49,85,217,.08)', color: 'primary.main' }}>
            <FiFileText size={28} />
          </Box>
          <Typography variant="h5" sx={{ mt: 2.5, mb: 1, fontWeight: 800 }}>Biblioteca este goală</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Începe cu primul tău articol.</Typography>
          <Button component={Link} to="/new" variant="contained" startIcon={<FiPlus />}>
            Creează un articol
          </Button>
        </Paper>
      ) : (
        <Stack spacing={{ xs: 4, md: 5 }}>
          {sortedCategories.map(category => (
            <Box key={category}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{category}</Typography>
                <Chip label={groupedArticles[category].length} size="small" sx={{ bgcolor: 'rgba(49,85,217,.08)', color: 'primary.main', fontWeight: 800 }} />
              </Stack>
              <Grid container spacing={2.5}>
                {groupedArticles[category].map(article => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={article.id}>
                    <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', overflow: 'hidden', transition: 'transform .2s ease, box-shadow .2s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 14px 34px rgba(23,33,58,.1)' } }}>
                      <Box sx={{ position: 'relative' }}>
                        {article.imageUrl ? (
                          <CardMedia component="img" height="180" image={article.imageUrl} alt="" sx={{ objectFit: 'cover' }} />
                        ) : (
                          <Box sx={{ height: 180, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #E8ECF8 0%, #F7F8FB 100%)', color: '#93A0BC' }}>
                            <FiImage size={38} />
                          </Box>
                        )}
                        <Chip
                          label={article.published ? 'Publicat' : 'Schiță'}
                          size="small"
                          sx={{ position: 'absolute', top: 14, right: 14, bgcolor: article.published ? '#E5F5EF' : '#FFF3DF', color: article.published ? '#146B4D' : '#91530C', fontWeight: 800, border: '1px solid', borderColor: article.published ? '#BEE6D7' : '#F3D59D' }}
                        />
                      </Box>
                      <CardContent sx={{ p: 2.5, pb: 1.5, flexGrow: 1 }}>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                          {article.category || 'General'}
                        </Typography>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mt: .75, lineHeight: 1.3 }}>
                          {article.title}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1, fontSize: 14, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {article.excerpt || article.content.substring(0, 120)}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'space-between', px: 2.5, pb: 2.25, pt: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">{formatDate(article.createdAt)}</Typography>
                        <Box>
                          <Button component={Link} to={`/edit/${article.id}`} size="small" startIcon={<FiEdit2 />} sx={{ mr: .5 }}>
                            Editează
                          </Button>
                          <Tooltip title="Șterge articolul">
                            <IconButton size="small" color="error" onClick={() => handleDelete(article.id)} aria-label={`Șterge ${article.title}`}>
                              <FiTrash2 size={17} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Stack>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Box>
  );
}
