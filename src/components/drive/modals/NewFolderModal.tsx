import React, { useState, useEffect, useRef } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useDrive } from '../../../context/DriveContext';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewFolderModal({ isOpen, onClose }: NewFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { createFolder, currentFolderId } = useDrive();

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    
    setIsCreating(true);
    await createFolder(folderName.trim(), currentFolderId);
    setIsCreating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="drive-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="drive-modal animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-warning" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">New folder</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Folder name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full h-11 px-4 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || isCreating}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
