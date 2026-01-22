import React,{ useEffect } from 'react';
import { Star, MoreVertical } from 'lucide-react';
import { Folder, ViewMode } from '../../types/drive';
import { FileIcon } from './FileIcon';
import { useDrive } from '../../context/DriveContext';

interface FolderItemProps {
  folder: Folder;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent, folder: Folder) => void;
}

export function FolderItem({ folder, viewMode, isSelected, onSelect, onOpen, onContextMenu }: FolderItemProps) {
  const { toggleStar, currentView } = useDrive();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

 // Add this useEffect at the top of FolderItem component
 // This will re-run whenever folder prop changes
useEffect(() => {
  console.log('🟡 FolderItem MOUNTED/RE-RENDERED:', {
    id: folder.id,
    name: folder.name,
    starred: folder.starred,
    parentId: folder.parentId,
    renderTime: Date.now()
  });
}, [folder]);
const isStarred = folder.starred || (folder as any).is_starred || false;

const handleStarClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  console.log('👆 Folder star clicked:', {
    id: folder.id,
    name: folder.name,
    currentStarred: folder.starred,
    isStarred: isStarred,
    timestamp: Date.now()
  });
  toggleStar(folder.id, true);
};

  const handleDoubleClick = () => {
    if (currentView !== 'trash') {
      onOpen();
    }
  };

  if (viewMode === 'grid') {

    
    return (
      <div
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => onContextMenu(e, folder)}
        className={`drive-file-item p-4 group ${isSelected ? 'drive-file-item-selected' : ''}`}
      >
        <div className="flex items-start justify-between mb-3">
          <FileIcon type="folder" size="lg" />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {currentView !== 'trash' && (
              <button
                onClick={handleStarClick}
                className="p-1.5 rounded-full hover:bg-secondary transition-colors"
              >
               <Star className={`w-4 h-4 ${folder.starred ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, folder);
              }}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        <h3 className="font-medium text-foreground truncate mb-1" title={folder.name}>
          {folder.name}
        </h3>
        
        <p className="text-xs text-muted-foreground">
          Folder
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => onContextMenu(e, folder)}
      className={`drive-file-item px-4 py-3 group flex items-center gap-4 ${isSelected ? 'drive-file-item-selected' : ''}`}
    >
      <FileIcon type="folder" size="sm" />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate" title={folder.name}>
          {folder.name}
        </h3>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span className="w-20 text-right">—</span>
        <span className="w-28 text-right">{formatDate(folder.createdAt)}</span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {currentView !== 'trash' && (
            <button
              onClick={handleStarClick}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            >
              <Star 
                className={`w-4 h-4 ${folder.starred ? 'fill-warning text-warning' : 'text-muted-foreground'}`} 
              />
            </button> 
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e, folder);
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