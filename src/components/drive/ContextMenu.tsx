import React, { useEffect, useRef } from 'react';
import { 
  Download, 
  Share2, 
  Star, 
  Pencil, 
  Trash2, 
  FolderInput, 
  Copy,
  RotateCcw,
  XCircle
} from 'lucide-react';
import { DriveFile, Folder } from '../../types/drive';
import { useDrive } from '../../context/DriveContext';

interface ContextMenuProps {
  x: number;
  y: number;
  item: DriveFile | Folder | null;
  isFolder: boolean;
  onClose: () => void;
  onRename: () => void;
  onMove: () => void;
  onShare: () => void;
}

export function ContextMenu({ 
  x, 
  y, 
  item, 
  isFolder, 
  onClose, 
  onRename, 
  onMove,
  onShare 
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggleStar, deleteItem, restoreItem, permanentlyDeleteItem, currentView, addToast,copyItem  } = useDrive();


   useEffect(() => {
    if (item) {
      console.log('🔍 ContextMenu Rendered with:', {
        itemId: item.id,
        itemName: item.name,
        itemStarred: item.starred,
        isStarredCalc: (item as any).starred || (item as any).is_starred || false,
        isFolder
      });
    }
  }, [item, isFolder]); 


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!item) return null;

  // Adjust position to keep menu in viewport
  const adjustedPosition = { x, y };
  if (menuRef.current) {
    const rect = menuRef.current.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
      adjustedPosition.x = window.innerWidth - rect.width - 10;
    }
    if (y + rect.height > window.innerHeight) {
      adjustedPosition.y = window.innerHeight - rect.height - 10;
    }
  }

  const handleDownload = () => {
    addToast(`Downloading "${item.name}"...`, 'info');
    onClose();
  };

 // Update handleCopy function
const handleCopy = async () => {
  if (!item) return;
  
  try {
    addToast(`Copying "${item.name}"...`, 'info');
    
    // Call the copy function from context
    await copyItem(item.id, isFolder);
    
    addToast(`"${item.name}" copied successfully`, 'success');
    onClose();
  } catch (error: any) {
    console.error('Copy failed:', error);
    addToast(error.response?.data?.error || 'Failed to copy item', 'error');
    onClose();
  }
};



  const handleStar = () => {
    toggleStar(item.id, isFolder);
    onClose();
  };

  const handleDelete = () => {
    deleteItem(item.id, isFolder);
    onClose();
  };

  const handleRestore = () => {
    restoreItem(item.id, isFolder);
    onClose();
  };

  const handlePermanentDelete = () => {
    permanentlyDeleteItem(item.id, isFolder);
    onClose();
  };

  const isInTrash = currentView === 'trash';
  
// In ContextMenu.tsx
// Replace the isStarred calculation (around line 71) with:
const isStarred = Boolean(
  (item as DriveFile).starred || 
  (item as Folder).starred || 
  (item as any).is_starred
);

// Update the Star button:
<button onClick={handleStar} className="drive-context-menu-item w-full">
  <Star 
    className={`w-4 h-4 ${isStarred ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
    fill={isStarred ? "currentColor" : "none"}
  />
  <span>{isStarred ? 'Remove from starred' : 'Add to starred'}</span>
</button>  

  return (
    <div
      ref={menuRef}
      className="drive-context-menu fixed animate-scale-in z-50"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      {isInTrash ? (
        <>
          <button onClick={handleRestore} className="drive-context-menu-item w-full">
            <RotateCcw className="w-4 h-4" />
            <span>Restore</span>
          </button>
          <div className="h-px bg-border my-1" />
          <button onClick={handlePermanentDelete} className="drive-context-menu-item w-full text-destructive hover:bg-destructive/10">
            <XCircle className="w-4 h-4" />
            <span>Delete permanently</span>
          </button>
        </>
      ) : (
        <>
          {!isFolder && (
            <button onClick={handleDownload} className="drive-context-menu-item w-full">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}
          
          {!isFolder && (
            <button onClick={() => { onShare(); onClose(); }} className="drive-context-menu-item w-full">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          )}
          
          <div className="h-px bg-border my-1" />
          
          <button onClick={handleStar} className="drive-context-menu-item w-full">
            <Star 
              className={`w-4 h-4 ${isStarred ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
              fill={isStarred ? "currentColor" : "none"}
            />
            <span>{isStarred ? 'Remove from starred' : 'Add to starred'}</span>
          </button>
          
          <button onClick={() => { onRename(); onClose(); }} className="drive-context-menu-item w-full">
            <Pencil className="w-4 h-4" />
            <span>Rename</span>
          </button>
          
          <button onClick={handleCopy} className="drive-context-menu-item w-full">
            <Copy className="w-4 h-4" />
            <span>Make a copy</span>
          </button>
          
          <button onClick={() => { onMove(); onClose(); }} className="drive-context-menu-item w-full">
            <FolderInput className="w-4 h-4" />
            <span>Move to</span>
          </button>
          
          <div className="h-px bg-border my-1" />
          
          <button onClick={handleDelete} className="drive-context-menu-item w-full text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
            <span>Move to trash</span>
          </button>
        </>
      )}
    </div>
  );
}