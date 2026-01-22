import React, { useRef } from 'react';
import { FolderPlus, Upload, Share2 } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

interface ToolbarProps {
  onNewFolder: () => void;
  onShare: () => void;
}

export function Toolbar({ onNewFolder, onShare }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, selectedItems, currentView } = useDrive();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      uploadFiles(files);
      e.target.value = '';
    }
  };

  if (currentView === 'trash') {
    return (
      <div className="flex items-center gap-2 px-1">
        <p className="text-sm text-muted-foreground">
          Items in trash will be automatically deleted after 30 days
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-1">
      <button
        onClick={onNewFolder}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
      >
        <FolderPlus className="w-4 h-4" />
        <span>New folder</span>
      </button>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <Upload className="w-4 h-4" />
        <span>Upload</span>
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {selectedItems.length > 0 && (
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium text-foreground"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      )}
    </div>
  );
}
