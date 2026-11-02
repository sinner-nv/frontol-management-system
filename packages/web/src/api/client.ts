import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30_000,
});

// Интерцептор для логирования ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.response?.data ?? error.message);
    return Promise.reject(error);
  },
);