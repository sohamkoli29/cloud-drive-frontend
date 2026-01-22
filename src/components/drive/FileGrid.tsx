import React from 'react';
import { DriveFile, Folder, ViewMode } from '../../types/drive';
import { FileItem } from './FileItem';
import { FolderItem } from './FolderItem';
import { useDrive } from '../../context/DriveContext';
import { FolderOpen } from 'lucide-react';

interface FileGridProps {
  files: DriveFile[];
  folders: Folder[];
  onFileContextMenu: (e: React.MouseEvent, file: DriveFile) => void;
  onFolderContextMenu: (e: React.MouseEvent, folder: Folder) => void;
}

export function FileGrid({ 
  files, 
  folders, 
  onFileContextMenu, 
  onFolderContextMenu 
}: FileGridProps) {
  const { 
    viewMode, 
    selectedItems, 
    setSelectedItems,
    setCurrentFolderId,
    currentView,
    isLoading
  } = useDrive();

  const handleSelect = (id: string, e?: React.MouseEvent) => {
    if (e?.ctrlKey || e?.metaKey) {
      setSelectedItems(
        selectedItems.includes(id)
          ? selectedItems.filter((i) => i !== id)
          : [...selectedItems, id]
      );
    } else {
      setSelectedItems([id]);
    }
  };

  const handleFolderOpen = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  if (isLoading) {
    return <FileGridSkeleton viewMode={viewMode} />;
  }

  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
          <FolderOpen className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {currentView === 'trash' ? 'Trash is empty' : 'No files or folders'}
        </h3>
        <p className="text-muted-foreground text-center max-w-sm">
          {currentView === 'trash' 
            ? 'Items you delete will appear here'
            : currentView === 'starred'
            ? 'Star files and folders to find them here'
            : currentView === 'shared'
            ? 'Files shared with you will appear here'
            : 'Drop files here or use the upload button to add files'
          }
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="space-y-6">
        {folders.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Folders</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {folders.map((folder) => (
                <FolderItem
                  key={`${folder.id}-${folder.starred}`}
                  folder={folder}
                  viewMode={viewMode}
                  isSelected={selectedItems.includes(folder.id)}
                  onSelect={() => handleSelect(folder.id)}
                  onOpen={() => handleFolderOpen(folder.id)}
                  onContextMenu={onFolderContextMenu}
                />
              ))}
            </div>
          </section>
        )}
        
        {files.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Files</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {files.map((file) => (
                <FileItem
                  key={`${file.id}-${file.starred}`}
                  file={file}
                  viewMode={viewMode}
                  isSelected={selectedItems.includes(file.id)}
                  onSelect={() => handleSelect(file.id)}
                  onContextMenu={onFileContextMenu}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* List Header */}
      <div className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
        <div className="w-8" />
        <div className="flex-1">Name</div>
        <div className="w-20 text-right">Size</div>
        <div className="w-28 text-right">Modified</div>
        <div className="w-20" />
      </div>
      
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          viewMode={viewMode}
          isSelected={selectedItems.includes(folder.id)}
          onSelect={() => handleSelect(folder.id)}
          onOpen={() => handleFolderOpen(folder.id)}
          onContextMenu={onFolderContextMenu}
        />
      ))}
      
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          viewMode={viewMode}
          isSelected={selectedItems.includes(file.id)}
          onSelect={() => handleSelect(file.id)}
          onContextMenu={onFileContextMenu}
        />
      ))}
    </div>
  );
}

function FileGridSkeleton({ viewMode }: { viewMode: ViewMode }) {
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {skeletonItems.map((i) => (
          <div key={i} className="drive-card p-4 space-y-3">
            <div className="w-14 h-14 drive-skeleton rounded-xl" />
            <div className="w-3/4 h-4 drive-skeleton" />
            <div className="w-1/2 h-3 drive-skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {skeletonItems.map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="w-8 h-8 drive-skeleton rounded-lg" />
          <div className="flex-1 h-4 drive-skeleton" />
          <div className="w-20 h-4 drive-skeleton" />
          <div className="w-28 h-4 drive-skeleton" />
        </div>
      ))}
    </div>
  );
}
