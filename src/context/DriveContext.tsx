import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { DriveFile, Folder, ViewMode, SortConfig, FilterType, UploadProgress, Toast, DriveView, SharedUser } from '../types/drive';
import { 
  authAPI, 
  foldersAPI, 
  filesAPI, 
  sharesAPI, 
  searchAPI 
} from '../services/api';
import { transformFiles, transformFolders } from '../utils/dataTransform';


interface DriveContextType {
  // Data
  files: DriveFile[];
  folders: Folder[];
  currentFolderId: string | null;
  currentView: DriveView;
  user: any | null;
  
  // UI State
  viewMode: ViewMode;
  sortConfig: SortConfig;
  filterType: FilterType;
  searchQuery: string;
  selectedItems: string[];
  uploadProgress: UploadProgress[];
  toasts: Toast[];
  isLoading: boolean;
  
  // Actions
  setCurrentFolderId: (id: string | null) => void;
  setCurrentView: (view: DriveView) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortConfig: (config: SortConfig) => void;
  setFilterType: (type: FilterType) => void;
  setSearchQuery: (query: string) => void;
  setSelectedItems: (items: string[]) => void;
  copyItem: (id: string, isFolder: boolean) => Promise<void>;
  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  
  // File Operations
  createFolder: (name: string, parentId: string | null) => Promise<void>;
  renameItem: (id: string, newName: string, isFolder: boolean) => Promise<void>;
  deleteItem: (id: string, isFolder: boolean) => Promise<void>;
  restoreItem: (id: string, isFolder: boolean) => Promise<void>;
  permanentlyDeleteItem: (id: string, isFolder: boolean) => Promise<void>;
  toggleStar: (id: string, isFolder: boolean) => Promise<void>;
  moveItem: (id: string, targetFolderId: string | null, isFolder: boolean) => Promise<void>;
  uploadFiles: (files: File[]) => void;
  searchUserByEmail: (email: string) => Promise<any>;
  shareFile: (fileId: string, user: SharedUser) => Promise<void>;
  removeShare: (fileId: string, email: string) => Promise<void>;
  
  generatePublicLink: (fileId: string, expiryDays: number, password?: string) => Promise<string>;
  
  // Toast
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  
  // Helpers
  getFolderPath: (folderId: string | null) => Folder[];
  getVisibleItems: () => { files: DriveFile[]; folders: Folder[] };
  refreshData: () => Promise<void>;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export function DriveProvider({ children }: { children: ReactNode }) {
  // State
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<DriveView>('my-drive');
  const [user, setUser] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ by: 'name', order: 'asc' });
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allFolders, setAllFolders] = useState<Folder[]>([]); // Store ALL folders for breadcrumbs

  // ============================================================================
  // Toast Functions
  // ============================================================================
  
  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ============================================================================
  // Authentication Functions
  // ============================================================================
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.data.accessToken && response.data.refreshToken) {
        localStorage.setItem('access_token', response.data.accessToken);
        localStorage.setItem('refresh_token', response.data.refreshToken);
        setUser(response.data.user);
        addToast('Logged in successfully', 'success');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      addToast(error.response?.data?.error || 'Login failed', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register({ email, password, name });
      
      if (response.data.accessToken && response.data.refreshToken) {
        localStorage.setItem('access_token', response.data.accessToken);
        localStorage.setItem('refresh_token', response.data.refreshToken);
        setUser(response.data.user);
        addToast('Account created successfully', 'success');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      addToast(error.response?.data?.error || 'Registration failed', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setFiles([]);
      setFolders([]);
      setAllFolders([]);
      addToast('Logged out successfully', 'success');
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const response = await authAPI.me();
      setUser(response.data);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return false;
    }
  };

  // ============================================================================
  // Data Fetching Functions
  // ============================================================================
const fetchAllFolders = async () => {
  try {
    console.log('🔵 Fetching folders with stars...');
    
    const response = await foldersAPI.getAllWithStars();
    
    // LOG THE RAW RESPONSE
    console.log('📦 Raw API Response:', {
      status: response.status,
      dataCount: response.data?.length,
      firstItem: response.data?.[0],
      hasIsStarred: response.data?.[0]?.hasOwnProperty('is_starred'),
      sampleIsStarred: response.data?.[0]?.is_starred
    });
    
    const transformedFolders = transformFolders(response.data || []);
    
    console.log('✅ Transformed folders:', {
      count: transformedFolders.length,
      firstFolder: transformedFolders[0],
      starredCount: transformedFolders.filter(f => f.starred).length
    });
    
    setAllFolders(transformedFolders);
    
    if (currentView === 'my-drive') {
      const filtered = transformedFolders.filter(f => 
        f.parentId === currentFolderId && !f.deleted
      );
      console.log('Filtered folders for current view:', filtered.length);
      setFolders(filtered);
    }
  } catch (error: any) {
    console.error('❌ Failed to fetch folders with stars:', {
      error: error.message,
      response: error.response?.data
    });
    
    // Fallback without crashing
    setAllFolders([]);
    setFolders([]);
  }
};

  const fetchFiles = async () => {
  try {
    const response = await searchAPI.search({ 
      folderId: currentFolderId || undefined 
    });
    const transformedFiles = await transformFiles(response.data.files || []);
    setFiles(transformedFiles);
  } catch (error) {
    console.error('Failed to fetch files:', error);
    addToast('Failed to load files', 'error');
    setFiles([]);
  }
};
  const fetchViewData = async () => {
    try {
      switch (currentView) {
        case 'my-drive': {
          await Promise.all([fetchAllFolders(), fetchFiles()]);
          break;
        }

        case 'starred':
        case 'shared':
        case 'recent':
        case 'trash': {
          const apiMap: Record<string, () => Promise<any>> = {
            starred: searchAPI.getStarred,
            shared: searchAPI.getShared,
            recent: searchAPI.getRecent,
            trash: searchAPI.getTrash,
          };

          const response = await apiMap[currentView]();

          const [files, folders] = await Promise.all([
            Promise.resolve(transformFiles(response.data.files || [])),
            Promise.resolve(transformFolders(response.data.folders || [])),
          ]);

          setFiles(files);
          setFolders(folders);
          setAllFolders(folders); // Also store in allFolders for consistency
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.error('Failed to fetch view data:', error);
      addToast('Failed to load data', 'error');
      setFiles([]);
      setFolders([]);
      setAllFolders([]);
    }
  };

  let refreshTimeout: NodeJS.Timeout | null = null;

  const refreshData = useCallback(async () => {
    if (!user) return;
    
    // Debounce refresh calls
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    
    setIsLoading(true);
    try {
      refreshTimeout = setTimeout(async () => {
        await fetchViewData();
      }, 300); // 300ms debounce
    } catch (error) {
      console.error('Refresh data error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentView, currentFolderId]);

  // ============================================================================
  // Folder Operations
  // ============================================================================
  
  const createFolder = async (name: string, parentId: string | null) => {
    try {
      setIsLoading(true);
      await foldersAPI.create({ 
        name, 
        parentId: parentId || undefined 
      });
      await refreshData();
      addToast(`Folder "${name}" created`, 'success');
    } catch (error: any) {
      console.error('Create folder error:', error);
      addToast(error.response?.data?.error || 'Failed to create folder', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // File Upload
  // ============================================================================

  const uploadFiles = async (filesToUpload: File[]) => {
    for (const file of filesToUpload) {
      const uploadId = `upload-${Date.now()}-${file.name}`;
      
      setUploadProgress((prev) => [
        ...prev,
        { id: uploadId, fileName: file.name, progress: 0, status: 'uploading' },
      ]);

      try {
        // 1. Initialize upload
        const initResponse = await filesAPI.initUpload({
          name: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          folderId: currentFolderId || undefined,
        });

        const { fileId, uploadUrl, storageKey } = initResponse.data;

        // 2. Upload file to presigned URL with progress tracking
        console.log('Uploading to:', uploadUrl);
        await filesAPI.uploadToPresignedUrl(uploadUrl, file, (progress) => {
          setUploadProgress((prev) =>
            prev.map((p) => (p.id === uploadId ? { ...p, progress } : p))
          );
        });

        // 3. Wait a moment for Supabase storage consistency
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Complete upload
        console.log('Completing upload for fileId:', fileId);
        await filesAPI.completeUpload(fileId, { parts: [] });

        // 5. Mark as completed
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.id === uploadId ? { ...p, progress: 100, status: 'completed' } : p
          )
        );

        addToast(`"${file.name}" uploaded successfully`, 'success');

        // Remove from progress after delay
        setTimeout(() => {
          setUploadProgress((prev) => prev.filter((p) => p.id !== uploadId));
        }, 2000);

        // Refresh file list
        await refreshData();
      } catch (error: any) {
        console.error('Upload error details:', {
          fileName: file.name,
          error: error.response?.data || error.message,
          status: error.response?.status,
        });
        
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.id === uploadId ? { ...p, status: 'error' } : p
          )
        );
        
        addToast(
          `Failed to upload "${file.name}"`,
          'error'
        );
      }
    }
  };

  // ============================================================================
  // Item Operations
  // ============================================================================
  
  const renameItem = async (id: string, newName: string, isFolder: boolean) => {
    try {
      setIsLoading(true);
      if (isFolder) {
        await foldersAPI.update(id, { name: newName });
      } else {
        await filesAPI.update(id, { name: newName });
      }
      await refreshData();
      addToast('Renamed successfully', 'success');
    } catch (error: any) {
      console.error('Rename error:', error);
      addToast(error.response?.data?.error || 'Failed to rename', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string, isFolder: boolean) => {
    try {
      setIsLoading(true);
      if (isFolder) {
        await foldersAPI.delete(id);
      } else {
        await filesAPI.delete(id);
      }
      await refreshData();
      addToast('Moved to trash', 'success');
    } catch (error: any) {
      console.error('Delete error:', error);
      addToast(error.response?.data?.error || 'Failed to delete', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const restoreItem = async (id: string, isFolder: boolean) => {
    try {
      setIsLoading(true);
      if (!isFolder) {
        await filesAPI.restore(id);
      }
      // TODO: Add folder restore endpoint
      await refreshData();
      addToast('Restored successfully', 'success');
    } catch (error: any) {
      console.error('Restore error:', error);
      addToast(error.response?.data?.error || 'Failed to restore', 'error');
    } finally {
      setIsLoading(false);
    }
  };

const permanentlyDeleteItem = async (id: string, isFolder: boolean) => {
  try {
    setIsLoading(true);
    if (isFolder) {
      await foldersAPI.permanentDelete(id); // Use new endpoint
    } else {
      await filesAPI.permanentDelete(id); // Use new endpoint
    }
    await refreshData();
    addToast('Deleted permanently', 'success');
  } catch (error: any) {
    console.error('Permanent delete error:', error);
    addToast(error.response?.data?.error || 'Failed to delete', 'error');
  } finally {
    setIsLoading(false);
  }
};
const copyItem = async (id: string, isFolder: boolean) => {
  try {
    setIsLoading(true);
    console.log('Copying item:', { id, isFolder });
    
    if (isFolder) {
      // For folders, we can pass null for newName to let backend generate it
      await foldersAPI.copy(id, { newName: null });
    } else {
      await filesAPI.copy(id, { newName: null });
    }
    
    await refreshData();
    addToast('Copied successfully', 'success');
  } catch (error: any) {
    console.error('Copy error details:', {
      error: error.response?.data,
      status: error.response?.status
    });
    addToast(error.response?.data?.error || 'Failed to copy', 'error');
  } finally {
    setIsLoading(false);
  }
};
const toggleStar = async (id: string, isFolder: boolean) => {
  try {
    console.log('🔵 Toggle star START:', { id, isFolder, timestamp: Date.now() });
    
    // Call API
    let response;
    if (isFolder) {
      response = await foldersAPI.toggleStar(id);
    } else {
      response = await filesAPI.toggleStar(id);
    }
    
    console.log('✅ API Response:', response.data);
    const { starred } = response.data;
    
    // Verify the backend actually saved it
    console.log('📡 Backend confirmed starred state:', starred);
    
    // IMMEDIATE optimistic update with functional setState
    if (isFolder) {
      setFolders(prev => prev.map(f => 
        f.id === id ? { ...f, starred } : f
      ));
      
      setAllFolders(prev => prev.map(f => 
        f.id === id ? { ...f, starred } : f
      ));
      
      console.log('🟢 Updated folder starred state:', { id, starred });
    } else {
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, starred } : f
      ));
      
      console.log('🟢 Updated file starred state:', { id, starred });
    }
    await refreshData();
    addToast(
      starred ? 'Added to starred' : 'Removed from starred', 
      'success'
    );
    
  } catch (error: any) {
    console.error('❌ Toggle star error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    addToast('Failed to update star', 'error');
    
    // Revert optimistic update on error
    if (isFolder) {
      setFolders(prev => prev.map(f => 
        f.id === id ? { ...f, starred: !f.starred } : f
      ));
      setAllFolders(prev => prev.map(f => 
        f.id === id ? { ...f, starred: !f.starred } : f
      ));
    } else {
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, starred: !f.starred } : f
      ));
    }
  }
};

const moveItem = async (id: string, targetFolderId: string | null, isFolder: boolean) => {
  console.log('📦 MoveItem START:', { id, targetFolderId, isFolder });
  
  try {
    setIsLoading(true);
    
    console.log('🚚 Starting move API call...');
    if (isFolder) {
      await foldersAPI.update(id, { parentId: targetFolderId || undefined });
    } else {
      await filesAPI.update(id, { folderId: targetFolderId || undefined });
    }
    console.log('✅ Move API call successful');
    
    console.log('🔄 Starting refreshData...');
    await refreshData();
    console.log('✅ refreshData successful');
    
    addToast('Moved successfully', 'success');
    console.log('🎉 Toast shown');
    
  } catch (error: any) {
    console.error('❌ Move error at step:', error);
    console.error('Error stack:', error.stack);
    console.error('Error response:', error.response?.data);
    
    addToast(error.response?.data?.error || 'Failed to move', 'error');
  } finally {
    setIsLoading(false);
    console.log('🏁 MoveItem END');
  }
};
  // ============================================================================
  // Sharing Functions
  // ============================================================================
  
// In DriveContext.tsx or api.ts
const searchUserByEmail = async (email: string) => {
  try {
    console.log('🔍 searchUserByEmail called:', email);
    
    const response = await sharesAPI.searchUser(email);
    console.log('✅ searchUserByEmail response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ searchUserByEmail error details:', {
      email,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Check for specific error message
    if (error.response?.data?.error?.includes('User with this email not found')) {
      throw new Error('User not found. Please ask them to create an account first.');
    }
    
    throw error;
  }
};
// In DriveContext.tsx - shareFile function
const shareFile = async (fileId: string, userData: SharedUser) => {
  try {
    setIsLoading(true);
    
    console.log('🔍 Finding file to share:', fileId);
    
    // First, check if the file exists
    const file = files.find(f => f.id === fileId);
    console.log('📄 File found:', file ? file.name : 'NOT FOUND');
    
    if (!file) {
      addToast('File not found', 'error');
      throw new Error('File not found');
    }
    
    console.log('👤 Searching user:', userData.email);
    
    // Verify the user exists
    const user = await searchUserByEmail(userData.email);
    console.log('✅ User found:', user.id);
    
    console.log('📤 Creating share...');
    
    // Create the share
    const response = await sharesAPI.create({
      resourceType: 'file',
      resourceId: fileId,
      email: userData.email,
      role: userData.role,
    });
    
    console.log('✅ Share created:', response.data);
    
 
    addToast(`Shared "${file.name}" with ${userData.email}`, 'success');
  } catch (error: any) {
    console.error('❌ Share error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });
    
    // Better error messages
    if (error.response?.status === 404) {
      addToast('File or user not found', 'error');
    } else if (error.response?.status === 400) {
      const errorMsg = error.response.data.error;
      if (errorMsg.includes('resourceType')) {
        addToast('System error: Invalid resource type', 'error');
      } else {
        addToast(errorMsg || 'Invalid request', 'error');
      }
    } else {
      addToast('Failed to share file', 'error');
    }
    
    throw error;
  } finally {
    setIsLoading(false);
  }
};

const removeShare = async (fileId: string, email: string) => {
  try {
    setIsLoading(true);
    
    // First, get all shares for this file
    const sharesResponse = await sharesAPI.list('file', fileId);
    const shares = sharesResponse.data || [];
    
    // Find the share with this email
    const shareToRemove = shares.find((share: any) => 
      share.grantee_email === email || share.grantee_user?.email === email
    );
    
    if (!shareToRemove) {
      throw new Error('Share not found');
    }
    
    // Delete the share
    await sharesAPI.delete(shareToRemove.id);
    
    await refreshData();
    addToast('Access removed', 'success');
  } catch (error: any) {
    console.error('Remove share error:', error);
    addToast(error.response?.data?.error || 'Failed to remove share', 'error');
    throw error;
  } finally {
    setIsLoading(false);
  }
};

const generatePublicLink = async (fileId: string, expiryDays: number, password?: string): Promise<string> => {
  try {
    setIsLoading(true);
    
    const response = await sharesAPI.createPublicLink({
      resourceType: 'file',
      resourceId: fileId,
      expiresIn: expiryDays,
      password,
    });
    
    const { url } = response.data;
    addToast('Public link generated', 'success');
    return url;
  } catch (error: any) {
    console.error('Generate link error:', error);
    addToast(error.response?.data?.error || 'Failed to generate link', 'error');
    throw error;
  } finally {
    setIsLoading(false);
  }
};


  // ============================================================================
  // Helper Functions
  // ============================================================================
  
  const getFolderPath = useCallback((folderId: string | null): Folder[] => {
    // If no folderId, we're at root
    if (!folderId) {
      return [];
    }

    console.log('Building breadcrumb path for folder:', folderId, 'Total folders in allFolders:', allFolders.length);

    // Try to find the folder in all folders (not just filtered ones)
    const folder = allFolders.find(f => f.id === folderId);
    
    if (!folder) {
      console.warn(`Folder ${folderId} not found in allFolders (currentView: ${currentView})`);
      
      // Check if we're not in "my-drive" view
      if (currentView !== 'my-drive') {
        console.log('Cannot build path in non-my-drive view without folder data');
        return [];
      }
      
      // For "my-drive" view, folder should exist if data loaded
      // Return empty array - breadcrumbs will show "My Drive" only
      return [];
    }

    // Build path from this folder to root
    const path: Folder[] = [folder];
    let currentFolder = folder;
    let depth = 0;
    const MAX_DEPTH = 20; // Prevent infinite loops
    
    while (currentFolder.parentId && depth < MAX_DEPTH) {
      depth++;
      const parent = allFolders.find(f => f.id === currentFolder.parentId);
      
      if (parent) {
        // Check for circular reference before adding
        if (path.some(p => p.id === parent.id)) {
          console.error('Circular reference detected in folder hierarchy!', {
            folderId,
            path: path.map(p => p.name),
            parentId: parent.id,
            parentName: parent.name
          });
          break;
        }
        
        path.unshift(parent);
        currentFolder = parent;
      } else {
        console.warn(`Parent folder ${currentFolder.parentId} not found for ${currentFolder.name}`);
        // Parent not in allFolders - we have a partial path
        // This can happen if we haven't loaded all folders yet
        break;
      }
    }
    
    console.log('Built breadcrumb path:', path.map(f => `${f.name} (${f.id})`));
    return path;
  }, [allFolders, currentView]); // Use allFolders instead of folders

  const getVisibleItems = useCallback(() => {
    // ALWAYS return arrays, never null/undefined
    let visibleFiles = Array.isArray(files) ? [...files] : [];
    let visibleFolders = Array.isArray(folders) ? [...folders] : [];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      visibleFiles = visibleFiles.filter((f: DriveFile) => 
        f.name.toLowerCase().includes(query)
      );
      visibleFolders = visibleFolders.filter((f: Folder) => 
        f.name.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      const typeMap: Record<FilterType, string[]> = {
        all: [],
        images: ['image'],
        pdfs: ['pdf'],
        docs: ['doc'],
        videos: ['video'],
        audio: ['audio'],
      };
      visibleFiles = visibleFiles.filter((f: DriveFile) => 
        typeMap[filterType]?.includes(f.type)
      );
    }

    // Apply sorting
    const sortFn = (a: DriveFile | Folder, b: DriveFile | Folder) => {
      let comparison = 0;
      switch (sortConfig.by) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'size':
          comparison = ('size' in a ? a.size : 0) - ('size' in b ? b.size : 0);
          break;
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    };

    visibleFiles = visibleFiles.sort(sortFn);
    visibleFolders = visibleFolders.sort(sortFn);

    // ALWAYS return valid arrays
    return { 
      files: visibleFiles, 
      folders: visibleFolders 
    };
  }, [files, folders, searchQuery, filterType, sortConfig]);

  // ============================================================================
  // Effects
  // ============================================================================
  
  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch data when view or folder changes
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [currentView, currentFolderId, user]);

  // ============================================================================
  // Context Provider
  // ============================================================================
  
  return (
    <DriveContext.Provider
      value={{
        copyItem,
        files,
        folders,
        currentFolderId,
        currentView,
        user,
        viewMode,
        sortConfig,
        filterType,
        searchQuery,
        selectedItems,
        uploadProgress,
        toasts,
        isLoading,
        setCurrentFolderId,
        setCurrentView,
        setViewMode,
        setSortConfig,
        setFilterType,
        setSearchQuery,
        setSelectedItems,
        login,
        register,
        logout,
        checkAuth,
        createFolder,
        renameItem,
        deleteItem,
        restoreItem,
        permanentlyDeleteItem,
        toggleStar,
        moveItem,
        uploadFiles,
        shareFile,
        removeShare,
        generatePublicLink,
        addToast,
        removeToast,
        getFolderPath,
        getVisibleItems,
        refreshData,
        searchUserByEmail
      }}
    >
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  const context = useContext(DriveContext);
  if (context === undefined) {
    throw new Error('useDrive must be used within a DriveProvider');
  }
  return context;
}