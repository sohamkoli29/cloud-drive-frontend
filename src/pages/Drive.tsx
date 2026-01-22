import React, { useState } from 'react';
import { Sidebar } from '../components/drive/Sidebar';
import { Topbar } from '../components/drive/Topbar';
import { Breadcrumbs } from '../components/drive/Breadcrumbs';
import { Toolbar } from '../components/drive/Toolbar';
import { FileGrid } from '../components/drive/FileGrid';
import { ContextMenu } from '../components/drive/ContextMenu';
import { UploadDropzone, UploadProgressBar } from '../components/drive/UploadDropzone';
import { ToastContainer } from '../components/drive/Toast';
import { NewFolderModal } from '../components/drive/modals/NewFolderModal';
import { RenameModal } from '../components/drive/modals/RenameModal';
import { MoveModal } from '../components/drive/modals/MoveModal';
import { ShareModal } from '../components/drive/modals/ShareModal';
import { NewItemModal } from '../components/drive/modals/NewItemModal';
import { useDrive } from '../context/DriveContext';
import { DriveFile, Folder } from '../types/drive';

export default function Drive() {
  const { getVisibleItems, setSelectedItems ,isLoading  } = useDrive();

  
const visibleItems = getVisibleItems();
const files = visibleItems?.files || [];
const folders = visibleItems?.folders || [];
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: DriveFile | Folder | null;
    isFolder: boolean;
  } | null>(null);
  
  // Modal states
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    item: DriveFile | Folder | null;
    isFolder: boolean;
  }>({ item: null, isFolder: false });

const handleContextMenu = (e: React.MouseEvent, item: DriveFile | Folder, isFolder: boolean) => {
  e.preventDefault();
  
  // DON'T use the item directly - get LATEST from state
  let latestItem: DriveFile | Folder;
  
  if (isFolder) {
    // Find folder in current state
    const foundFolder = folders.find(f => f.id === item.id);
    latestItem = foundFolder || item;
    
    console.log('📋 Context Menu Folder:', {
      itemId: item.id,
      snapshotStarred: item.starred,
      currentStarred: foundFolder?.starred,
      usingLatest: !!foundFolder
    });
  } else {
    // Find file in current state
    const foundFile = files.find(f => f.id === item.id);
    latestItem = foundFile || item;
    
    console.log('📋 Context Menu File:', {
      itemId: item.id,
      snapshotStarred: (item as DriveFile).starred,
      currentStarred: foundFile?.starred,
      usingLatest: !!foundFile
    });
  }
  
  setContextMenu({ x: e.clientX, y: e.clientY, item: latestItem, isFolder });
  setSelectedItems([item.id]);
};

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleRename = () => {
    if (contextMenu?.item) {
      setSelectedItem({ item: contextMenu.item, isFolder: contextMenu.isFolder });
      setIsRenameModalOpen(true);
    }
  };

  const handleMove = () => {
    if (contextMenu?.item) {
      setSelectedItem({ item: contextMenu.item, isFolder: contextMenu.isFolder });
      setIsMoveModalOpen(true);
    }
  };

  const handleShare = () => {
    if (contextMenu?.item && !contextMenu.isFolder) {
      setSelectedItem({ item: contextMenu.item, isFolder: false });
      setIsShareModalOpen(true);
    }
  };

  const handleToolbarShare = () => {
    // For toolbar share, we'd need to get the selected file
    // For simplicity, this opens the share modal if there's a context menu item
    setIsShareModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar onNewClick={() => setIsNewItemModalOpen(true)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        
        <UploadDropzone>
          <div className="flex-1 flex flex-col p-6 overflow-auto scrollbar-thin">
            {/* Breadcrumbs */}
            <div className="mb-4">
              <Breadcrumbs />
            </div>
            
            {/* Toolbar */}
            <div className="mb-6">
              <Toolbar 
                onNewFolder={() => setIsNewFolderModalOpen(true)}
                onShare={handleToolbarShare}
              />
            </div>
            
            {/* File Grid */}
<FileGrid
  files={files}
  folders={folders}
  onFileContextMenu={(e, file) => handleContextMenu(e, file, false)}
  onFolderContextMenu={(e, folder) => handleContextMenu(e, folder, true)}
/>
          </div>
        </UploadDropzone>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          isFolder={contextMenu.isFolder}
          onClose={handleCloseContextMenu}
          onRename={handleRename}
          onMove={handleMove}
          onShare={handleShare}
        />
      )}
      
      {/* Modals */}
      <NewItemModal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        onNewFolder={() => setIsNewFolderModalOpen(true)}
      />
      
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
      />
      
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        item={selectedItem.item}
        isFolder={selectedItem.isFolder}
      />
      
      <MoveModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        item={selectedItem.item}
        isFolder={selectedItem.isFolder}
      />
      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        file={!selectedItem.isFolder ? selectedItem.item as DriveFile : null}
      />
      
      {/* Upload Progress */}
      <UploadProgressBar />
      
      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}
