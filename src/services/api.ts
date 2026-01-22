import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor
// In api.ts - check if the interceptor is working
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log('📡 API Request:', {
      url: config.url,
      hasToken: !!token,
      headers: config.headers
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic - FIXED
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

let refreshRetryCount = 0;
const MAX_REFRESH_RETRIES = 2;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

     if (!error.response) {
      console.error('🌐 Network error detected:', {
        message: error.message,
        code: error.code,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method
        } : 'No config available'
      });
      return Promise.reject(new Error('Network error - please check your connection'));
    }
    // Handle 401 errors
    if (error.response.status === 401 && !originalRequest._retry) {

       if (refreshRetryCount >= MAX_REFRESH_RETRIES) {
        // Too many refresh attempts, force logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(new Error('Too many refresh attempts'));
      }

      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshRetryCount++;
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('access_token', accessToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
      refreshRetryCount = 0;
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const starsAPI = {
  toggle: (data: { resourceType: 'file' | 'folder', resourceId: string }) =>
    api.post('/stars/toggle', data),
  
  getStarred: () => api.get('/stars/starred'),
};


// Folders API
export const foldersAPI = {
  create: (data: { name: string; parentId?: string }) =>
    api.post('/folders', data),
  get: (id: string) => api.get(`/folders/${id}`),
  update: (id: string, data: { name?: string; parentId?: string }) =>
    api.patch(`/folders/${id}`, data),
  delete: (id: string) => api.delete(`/folders/${id}`),
  list: (parentId?: string) =>
  api.get('/folders', { 
    params: parentId ? { parentId } : {} // Send empty params for all folders
  }),
  // In foldersAPI object
getAll: () => 
  api.get('/folders/all'),

 permanentDelete: (id: string) => api.delete(`/folders/${id}/permanent`),// We need to create this endpoint

toggleStar: (id: string) => api.post('/stars/toggle', {
  resourceType: 'folder',
  resourceId: id
}),
  isStarred: (id: string) => api.get(`/folders/${id}/star`),
   getAllWithStars: () => api.get('/folders/with-stars'),
   copy: (id: string, data?: { newName?: string }) => 
    api.post(`/folders/${id}/copy`, data || {}), 
  
  duplicate: (id: string) => api.post(`/folders/${id}/duplicate`),

};

// Files API - FIXED
export const filesAPI = {
  initUpload: (data: {
    name: string;
    mimeType: string;
    sizeBytes: number;
    folderId?: string;
  }) => api.post('/files/init', data),

  completeUpload: (fileId: string, data: {
    parts?: Array<{ partNumber: number; etag: string }>;
  }) => api.post(`/files/${fileId}/complete`, data),

  // Upload file to presigned URL
  uploadToPresignedUrl: async (url: string, file: File, onProgress?: (progress: number) => void) => {
    return axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },

  get: (id: string) => api.get(`/files/${id}`),
  download: (id: string) => api.get(`/files/${id}/download`),

// filesAPI object
update: (id: string, data: { name?: string; folderId?: string | null }) =>
  api.patch(`/files/${id}`, data),

  delete: (id: string) => api.delete(`/files/${id}`),
  restore: (id: string) => api.post(`/files/${id}/restore`),

  list: (folderId?: string) =>
    api.get('/files', { params: { folderId: folderId || '' } }),
  permanentDelete: (id: string) => api.delete(`/files/${id}/permanent`),

  toggleStar: (id: string) => api.post('/stars/toggle', {
  resourceType: 'file',
  resourceId: id
}),
  isStarred: (id: string) => api.get(`/files/${id}/star`),
     copy: (id: string, data?: { newName?: string }) => 
    api.post(`/files/${id}/copy`, data || {}),
  
  duplicate: (id: string) => api.post(`/files/${id}/duplicate`),
};

// Update src/services/api.ts - add new share endpoints
export const sharesAPI = {
  // Existing endpoints
  create: (data: {
    resourceType: 'file' | 'folder';
    resourceId: string;
    email: string;
    role: 'viewer' | 'editor';
  }) => {
    console.log('📡 API Request - create share:', data);
    return api.post('/shares', data);
  },

  list: (resourceType: 'file' | 'folder', resourceId: string) =>
    api.get(`/shares/${resourceType}/${resourceId}`),

  delete: (id: string) => api.delete(`/shares/${id}`),

  // NEW: Search users by email
  searchUser: (email: string) =>
    api.get('/shares/users/search', { params: { email } }),

  // NEW: Create public link
  createPublicLink: (data: {
    resourceType: 'file' | 'folder';
    resourceId: string;
    expiresIn: number; // days
    password?: string;
  }) => api.post('/shares/public-link', data),

  // NEW: Get public link details
  getPublicLink: (token: string) =>
    api.get(`/shares/public-link/${token}`),

  // NEW: Revoke public link
  revokePublicLink: (token: string) =>
    api.delete(`/shares/public-link/${token}`),
};

// Search API - FIXED
export const searchAPI = {
  search: (params: {
    q?: string;
    type?: string;
    starred?: boolean;
    shared?: boolean;
    folderId?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/search', { params }),

  getTrash: () => api.get('/search/trash'),
  getStarred: () => api.get('/search/starred'),
  getRecent: () => api.get('/search/recent'),
  getShared: () => api.get('/search/shared'),
  
};

export default api;