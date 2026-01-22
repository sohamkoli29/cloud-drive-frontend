import React, { useState } from 'react';
import { X, FolderInput, Folder, ChevronRight, Home } from 'lucide-react';
import { useDrive } from '../../../context/DriveContext';
import { DriveFile, Folder as FolderType } from '../../../types/drive';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DriveFile | FolderType | null;
  isFolder: boolean;
}

export function MoveModal({ isOpen, onClose, item, isFolder }: MoveModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const { folders, moveItem, getFolderPath } = useDrive();

  const availableFolders = folders.filter(f => 
    !f.deleted && 
    f.id !== item?.id && 
    f.parentId === currentPath
  );

  const currentPathFolders = getFolderPath(currentPath);

  const handleSubmit = async () => {
    if (!item) return;
    
    setIsMoving(true);
    await moveItem(item.id, selectedFolderId, isFolder);
    setIsMoving(false);
    onClose();
  };

  const handleFolderClick = (folderId: string) => {
    if (selectedFolderId === folderId) {
      // Double click - navigate into folder
      setCurrentPath(folderId);
      setSelectedFolderId(null);
    } else {
      setSelectedFolderId(folderId);
    }
  };

  const handleFolderDoubleClick = (folderId: string) => {
    setCurrentPath(folderId);
    setSelectedFolderId(null);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="drive-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="drive-modal animate-scale-in max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderInput className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Move "{item.name}"</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 mb-4 text-sm">
            <button
              onClick={() => { setCurrentPath(null); setSelectedFolderId(null); }}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                currentPath === null ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>My Drive</span>
            </button>
            
            {currentPathFolders.map((folder) => (
              <React.Fragment key={folder.id}>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <button
                  onClick={() => { setCurrentPath(folder.id); setSelectedFolderId(null); }}
                  className="px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Folder List */}
          <div className="border border-border rounded-lg max-h-60 overflow-y-auto">
            {/* Move to current location option */}
            <button
              onClick={() => setSelectedFolderId(currentPath)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                selectedFolderId === currentPath 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-secondary text-foreground'
              }`}
            >
              <Folder className="w-5 h-5 text-warning" />
              <span className="font-medium">Move here</span>
            </button>
            
            {availableFolders.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No subfolders
              </div>
            ) : (
              availableFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  onDoubleClick={() => handleFolderDoubleClick(folder.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    selectedFolderId === folder.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <Folder className="w-5 h-5 text-warning" />
                  <span>{folder.name}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </button>
              ))
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            Double-click a folder to navigate into it
          </p>
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isMoving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMoving ? 'Moving...' : 'Move'}
          </button>
        </div>
      </div>
    </div>
  );
}
