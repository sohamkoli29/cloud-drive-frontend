import React,{useEffect} from 'react';
import { Star, MoreVertical, Users } from 'lucide-react';
import { DriveFile, ViewMode } from '../../types/drive';
import { FileIcon } from './FileIcon';
import { useDrive } from '../../context/DriveContext';

interface FileItemProps {
  file: DriveFile;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent, file: DriveFile) => void;
}

export function FileItem({ file, viewMode, isSelected, onSelect, onContextMenu }: FileItemProps) {
  const { toggleStar, currentView } = useDrive();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
 useEffect(() => {
  console.log('🔍 FileItem Debug:', {
    fileId: file.id,
    fileName: file.name,
    starred: file.starred,
    is_starred: (file as any).is_starred,
    allProperties: Object.keys(file)
  });
}, [file]);
const isStarred = file.starred || (file as any).is_starred || false;

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStar(file.id, false);
  };

  if (viewMode === 'grid') {
    return (
      <div
        onClick={onSelect}
        onContextMenu={(e) => onContextMenu(e, file)}
        className={`drive-file-item p-4 group ${isSelected ? 'drive-file-item-selected' : ''}`}
      >
        <div className="flex items-start justify-between mb-3">
          <FileIcon type={file.type} size="lg" />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {currentView !== 'trash' && (
              <button
                onClick={handleStarClick}
                className="p-1.5 rounded-full hover:bg-secondary transition-colors"
              >
          <Star 
  className={`w-4 h-4 ${isStarred ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
  fill={isStarred ? "currentColor" : "none"}
/>
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, file);
              }}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        <h3 className="font-medium text-foreground truncate mb-1" title={file.name}>
          {file.name}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatSize(file.size)}</span>
          {file.sharedWith.length > 0 && (
            <>
              <span>•</span>
              <Users className="w-3 h-3" />
              <span>Shared</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      onContextMenu={(e) => onContextMenu(e, file)}
      className={`drive-file-item px-4 py-3 group flex items-center gap-4 ${isSelected ? 'drive-file-item-selected' : ''}`}
    >
      <FileIcon type={file.type} size="sm" />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate" title={file.name}>
          {file.name}
        </h3>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        {file.sharedWith.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
          </div>
        )}
        
        <span className="w-20 text-right">{formatSize(file.size)}</span>
        <span className="w-28 text-right">{formatDate(file.createdAt)}</span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {currentView !== 'trash' && (
            <button
              onClick={handleStarClick}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            >
      <Star 
  className={`w-4 h-4 ${isStarred ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
  fill={isStarred ? "currentColor" : "none"}
/>
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e, file);
            }}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}