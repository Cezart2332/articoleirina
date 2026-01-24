import { Article, UploadResponse } from './types';

const API_BASE = 'http://localhost:3001';

export async function fetchArticles(): Promise<Article[]> {
  const response = await fetch(`${API_BASE}/api/articles`);
  if (!response.ok) throw new Error('Failed to fetch articles');
  return response.json();
}

export async function fetchArticle(id: string): Promise<Article> {
  const response = await fetch(`${API_BASE}/api/articles/${id}`);
  if (!response.ok) throw new Error('Failed to fetch article');
  return response.json();
}

export async function createArticle(article: Partial<Article>): Promise<Article> {
  const response = await fetch(`${API_BASE}/api/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });
  if (!response.ok) throw new Error('Failed to create article');
  return response.json();
}

export async function updateArticle(id: string, article: Partial<Article>): Promise<Article> {
  const response = await fetch(`${API_BASE}/api/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });
  if (!response.ok) throw new Error('Failed to update article');
  return response.json();
}

export async function deleteArticle(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/articles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete article');
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload image');
  return response.json();
}

export async function deleteImage(filename: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/upload/${filename}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete image');
}
