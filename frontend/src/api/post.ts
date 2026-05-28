import api from './axios';
import type { ApiResponse, Post, Comment, Page, PostCategory } from '../types';

export interface PostParams {
  page?: number;
  size?: number;
  category?: PostCategory;
  keyword?: string;
  sort?: string;
  userId?: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: PostCategory;
  productIds?: number[];
  images?: File[];
}

export const getPosts = (params?: PostParams) =>
  api.get<ApiResponse<Page<Post>>>('/posts', { params });

export const getPost = (id: number) =>
  api.get<ApiResponse<Post>>(`/posts/${id}`);

export const createPost = (data: CreatePostData) => {
  const form = new FormData();
  form.append('title', data.title);
  form.append('content', data.content);
  form.append('category', data.category);
  data.productIds?.forEach((id) => form.append('productIds', String(id)));
  data.images?.forEach((file) => form.append('images', file));
  return api.post<ApiResponse<Post>>('/posts', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deletePost = (id: number) =>
  api.delete<ApiResponse<void>>(`/posts/${id}`);

export const toggleLike = (id: number) =>
  api.post<ApiResponse<{ liked: boolean; likes: number }>>(`/posts/${id}/like`);

export const getComments = (postId: number) =>
  api.get<ApiResponse<Comment[]>>(`/comments/posts/${postId}`);

export const createComment = (postId: number, content: string) =>
  api.post<ApiResponse<Comment>>(`/comments/posts/${postId}`, { content });
