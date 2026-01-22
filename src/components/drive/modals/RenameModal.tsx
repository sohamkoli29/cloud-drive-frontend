import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil } from 'lucide-react';
import { useDrive } from '../../../context/DriveContext';
import { DriveFile, Folder } from '../../../types/drive';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DriveFile | Folder | null;
  isFolder: boolean;
}

export function RenameModal({ isOpen, onClose, item, isFolder }: RenameModalProps) {
  const [newName, setNewName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { renameItem } = useDrive();

  useEffect(() => {
    if (isOpen && item) {
      setNewName(item.name);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !item) return;
    
    setIsRenaming(true);
    await renameItem(item.id, newName.trim(), isFolder);
    setIsRenaming(false);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="drive-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="drive-modal animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Rename</h2>
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
              New name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
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
              disabled={!newName.trim() || newName === item.name || isRenaming}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRenaming ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
