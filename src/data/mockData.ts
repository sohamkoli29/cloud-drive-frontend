import { Folder, DriveFile, SharedUser } from '../types/drive';

export const mockFolders: Folder[] = [
  { id: 'folder-1', name: 'Documents', parentId: null, createdAt: new Date('2024-01-15'), starred: false, deleted: false },
  { id: 'folder-2', name: 'Images', parentId: null, createdAt: new Date('2024-01-20'), starred: true, deleted: false },
  { id: 'folder-3', name: 'Projects', parentId: null, createdAt: new Date('2024-02-01'), starred: false, deleted: false },
  { id: 'folder-4', name: 'Work', parentId: 'folder-1', createdAt: new Date('2024-02-10'), starred: false, deleted: false },
  { id: 'folder-5', name: 'Personal', parentId: 'folder-1', createdAt: new Date('2024-02-15'), starred: false, deleted: false },
  { id: 'folder-6', name: 'Vacation 2024', parentId: 'folder-2', createdAt: new Date('2024-03-01'), starred: true, deleted: false },
  { id: 'folder-7', name: 'Screenshots', parentId: 'folder-2', createdAt: new Date('2024-03-05'), starred: false, deleted: false },
  { id: 'folder-8', name: 'Archive', parentId: null, createdAt: new Date('2024-01-01'), starred: false, deleted: true },
];

export const mockFiles: DriveFile[] = [
  { id: 'file-1', name: 'Project Proposal.pdf', size: 2457600, type: 'pdf', folderId: 'folder-4', createdAt: new Date('2024-03-10'), starred: true, deleted: false, sharedWith: [] },
  { id: 'file-2', name: 'Budget Report.xlsx', size: 1048576, type: 'spreadsheet', folderId: 'folder-4', createdAt: new Date('2024-03-12'), starred: false, deleted: false, sharedWith: [] },
  { id: 'file-3', name: 'Meeting Notes.docx', size: 524288, type: 'doc', folderId: 'folder-4', createdAt: new Date('2024-03-15'), starred: false, deleted: false, sharedWith: [] },
  { id: 'file-4', name: 'Resume.pdf', size: 307200, type: 'pdf', folderId: 'folder-5', createdAt: new Date('2024-02-20'), starred: true, deleted: false, sharedWith: [] },
  { id: 'file-5', name: 'Beach Sunset.jpg', size: 4194304, type: 'image', folderId: 'folder-6', createdAt: new Date('2024-03-02'), starred: true, deleted: false, sharedWith: [] },
  { id: 'file-6', name: 'Mountain View.png', size: 3670016, type: 'image', folderId: 'folder-6', createdAt: new Date('2024-03-03'), starred: false, deleted: false, sharedWith: [] },
  { id: 'file-7', name: 'App Screenshot.png', size: 1572864, type: 'image', folderId: 'folder-7', createdAt: new Date('2024-03-06'), starred: false, deleted: false, sharedWith: [] },
  { id: 'file-8', name: 'Presentation.pptx', size: 5242880, type: 'doc', folderId: 'folder-3', createdAt: new Date('2024-02-25'), starred: false, deleted: false, sharedWith: [{ email: 'john@example.com', role: 'editor', name: 'John Doe' }] },
  { id: 'file-9', name: 'Code Review.mp4', size: 52428800, type: 'video', folderId: 'folder-3', createdAt: new Date('2024-03-01'), starred: false, deleted: false, sharedWith: [] },
  { id: 'file-10', name: 'Podcast Episode.mp3', size: 31457280, type: 'audio', folderId: null, createdAt: new Date('2024-03-08'), starred: false, deleted: false, sharedWith: [] },
  { id: 'file-11', name: 'Backup.zip', size: 104857600, type: 'archive', folderId: null, createdAt: new Date('2024-03-10'), starred: false, deleted: false, sharedWith: [] },
  { id: 'file-12', name: 'Notes.txt', size: 10240, type: 'default', folderId: null, createdAt: new Date('2024-03-12'), starred: false, deleted: false, sharedWith: [] },
  { id: 'file-13', name: 'Old Report.pdf', size: 1024000, type: 'pdf', folderId: null, createdAt: new Date('2024-01-05'), starred: false, deleted: true, sharedWith: [] },
  { id: 'file-14', name: 'Deleted Image.jpg', size: 2048000, type: 'image', folderId: null, createdAt: new Date('2024-01-10'), starred: false, deleted: true, sharedWith: [] },
];

export const mockUser = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
};
