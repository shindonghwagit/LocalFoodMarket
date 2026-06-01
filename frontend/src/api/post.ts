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
  imageUrls?: string[];
}

export const getPosts = (params?: PostParams) =>
  api.get<ApiResponse<Page<Post>>>('/posts', { params });

export const getPost = (id: number) =>
  api.get<ApiResponse<Post>>(`/posts/${id}`);

export const createPost = (data: CreatePostData) =>
  api.post<ApiResponse<Post>>('/posts', {
    title: data.title,
    content: data.content,
    category: data.category,
    productIds: data.productIds ?? [],
    imageUrls: data.imageUrls ?? [],
  });

export const deletePost = (id: number) =>
  api.delete<ApiResponse<void>>(`/posts/${id}`);

export const toggleLike = (id: number) =>
  api.post<ApiResponse<{ liked: boolean; likes: number }>>(`/posts/${id}/like`);

export const getComments = (postId: number) =>
  api.get<ApiResponse<Comment[]>>(`/comments/posts/${postId}`);

export const createComment = (postId: number, content: string) =>
  api.post<ApiResponse<Comment>>(`/comments/posts/${postId}`, { content });
