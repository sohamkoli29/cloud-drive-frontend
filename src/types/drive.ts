export type FileType = 'image' | 'pdf' | 'doc' | 'spreadsheet' | 'video' | 'audio' | 'archive' | 'default';

export interface SharedUser {
  email: string;
  name?: string;
  role: 'viewer' | 'editor';
}

export interface DriveFile {
  id: string;
  name: string;
  size: number;
  type: FileType;
  folderId: string | null;
  createdAt: Date;
  starred: boolean;
  deleted: boolean;
  sharedWith: SharedUser[];
  publicLink?: {
    url: string;
    expiresAt: Date;
    password?: string;
  };
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  starred: boolean;
  deleted: boolean;
}

export type ViewMode = 'grid' | 'list';

export type SortBy = 'name' | 'date' | 'size';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  by: SortBy;
  order: SortOrder;
}

export type FilterType = 'all' | 'images' | 'pdfs' | 'docs' | 'videos' | 'audio';

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type DriveView = 'my-drive' | 'shared' | 'starred' | 'recent' | 'trash';
