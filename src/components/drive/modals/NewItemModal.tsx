import React, { useRef } from 'react';
import { X, FolderPlus, Upload, FileUp } from 'lucide-react';
import { useDrive } from '../../../context/DriveContext';

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewFolder: () => void;
}

export function NewItemModal({ isOpen, onClose, onNewFolder }: NewItemModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles } = useDrive();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      uploadFiles(files);
      e.target.value = '';
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drive-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="drive-modal animate-scale-in max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create new</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-2">
          <button
            onClick={() => {
              onNewFolder();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">New folder</p>
              <p className="text-sm text-muted-foreground">Create a new folder</p>
            </div>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">File upload</p>
              <p className="text-sm text-muted-foreground">Upload files from your device</p>
            </div>
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
