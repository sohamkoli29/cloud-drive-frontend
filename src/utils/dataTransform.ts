// Transform backend data (snake_case) to frontend (camelCase)
import {sharesAPI} from '../services/api'
export interface BackendFile {
  id: string;
  name: string;
  mime_type: string;
  size_bytes: number;
  storage_key: string;
  owner_id: string;
  folder_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  is_starred?: boolean; 
}

export interface BackendFolder {
  id: string;
  name: string;
  owner_id: string;
  parent_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  is_starred?: boolean; // Add this
} 

import { DriveFile, Folder,SharedUser } from '../types/drive';
export const transformFolder = (backendFolder: BackendFolder): Folder => {
  const transformed = {
    id: backendFolder.id,
    name: backendFolder.name,
    parentId: backendFolder.parent_id,
    createdAt: new Date(backendFolder.created_at),
    starred: Boolean(backendFolder.is_starred), // ✅ Read from backend
    deleted: backendFolder.is_deleted
  };
  
  console.log('🔄 Transform folder:', {
    id: backendFolder.id,
    name: backendFolder.name,
    backend_is_starred: backendFolder.is_starred,
    frontend_starred: transformed.starred
  });
  
  return transformed;
};
export const transformFile = async (backendFile: BackendFile): Promise<DriveFile> => {
  const token = localStorage.getItem('access_token');
  let sharedWith: SharedUser[] = [];
  
  try {
    // Only fetch shares if we have a token (user is logged in)
    if (token) {
      const sharesResponse = await sharesAPI.list('file', backendFile.id);
      sharedWith = (sharesResponse.data || []).map((share: any) => ({
        email: share.grantee_user?.email || 'unknown@example.com',
        name: share.grantee_user?.name || 'Unknown User',
        role: share.role || 'viewer'
      }));
    }
  } catch (error) {
    console.error('Failed to fetch shares:', error);
  }
  
  return {
    id: backendFile.id,
    name: backendFile.name,
    size: backendFile.size_bytes || 0,
    type: getFileTypeFromMime(backendFile.mime_type || ''),
    folderId: backendFile.folder_id,
    createdAt: new Date(backendFile.created_at),
    starred: Boolean(backendFile.is_starred),
    deleted: backendFile.is_deleted,
    sharedWith: sharedWith
  };
};

// FIX transformFiles to be async

const getFileTypeFromMime = (mimeType: string): DriveFile['type'] => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
  return 'default';
};



export const transformFolders = (backendFolders: BackendFolder[]): Folder[] => {
  return backendFolders.map(transformFolder);
};
export const transformFiles = async (backendFiles: BackendFile[]): Promise<DriveFile[]> => {
  
  return Promise.all(backendFiles.map(transformFile));
};