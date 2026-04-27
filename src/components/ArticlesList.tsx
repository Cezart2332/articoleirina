import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { fetchArticles, deleteArticle } from '../api';
import Toast from './Toast';
import { FiEdit2, FiPlus, FiTrash2, FiFileText, FiImage } from 'react-icons/fi';
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
  IconButton
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, p: 3, bgcolor: 'rgba(47, 119, 186, 0.08)', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'text.primary' }}>
          <FiFileText style={{ marginRight: '12px', color: '#2F77BA' }} /> Admin Articole
        </Typography>
        <Button
          component={Link}
          to="/new"
          variant="contained"
          color="secondary"
          startIcon={<FiPlus />}
        >
          Articol Nou
        </Button>
      </Box>

      {articles.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed', borderColor: 'warning.main' }} elevation={0}>
          <FiFileText size={48} color="#A57B37" />
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Niciun articol încă</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Creează primul articol pentru a începe.</Typography>
          <Button component={Link} to="/new" variant="contained" color="primary" startIcon={<FiPlus />}>
            Creează Articol
          </Button>
        </Paper>
      ) : (
        <Box>
          {sortedCategories.map((category) => (
            <Box key={category} sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 'semibold', mb: 2, color: 'success.main' }}>
                {category}
              </Typography>
              <Grid container spacing={3}>
                {groupedArticles[category]
                  .map(article => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', border: 1, borderColor: 'divider' }} elevation={0}>
                        {article.imageUrl ? (
                          <CardMedia
                            component="img"
                            height="200"
                            image={article.imageUrl}
                            alt={article.title}
                          />
                        ) : (
                          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(61, 93, 122, 0.10)' }}>
                            <FiImage size={48} color="#3D5D7A" />
                          </Box>
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Chip label={article.category || 'General'} size="small" color="info" variant="outlined" />
                            <Chip 
                              label={article.published ? 'Publicat' : 'Draft'} 
                              size="medium" 
                              color={article.published ? 'secondary' : 'warning'}
                              variant={article.published ? 'filled' : 'outlined'}
                            />
                          </Box>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }} gutterBottom>
                            {article.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {article.excerpt || article.content.substring(0, 100)}...
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(article.createdAt)}
                          </Typography>
                          <Box>
                            <Button 
                              component={Link} 
                              to={"/edit/"+article.id} 
                              size="small" 
                              startIcon={<FiEdit2 />}
                              sx={{ mr: 1 }}
                              variant="outlined"
                              color="info"
                            >
                              Editează
                            </Button>
                            <IconButton 
                              size="small" 
                              color="warning" 
                              onClick={() => handleDelete(article.id)}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

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
