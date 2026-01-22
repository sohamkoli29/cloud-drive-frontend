import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { BreadcrumbSkeleton } from './BreadcrumbSkeleton'; // Import skeleton

export function Breadcrumbs() {
  const { 
    currentFolderId, 
    getFolderPath, 
    setCurrentFolderId, 
    currentView,
    isLoading 
  } = useDrive();
  
  // Show skeleton while loading
  if (isLoading) {
    return <BreadcrumbSkeleton />;
  }
  
  // Handle special views
  if (currentView !== 'my-drive') {
    const viewLabels: Record<string, string> = {
      'shared': 'Shared with me',
      'starred': 'Starred',
      'recent': 'Recent',
      'trash': 'Trash',
    };
    
    return (
      <div className="drive-breadcrumb px-1">
        <span className="drive-breadcrumb-current text-lg font-medium">
          {viewLabels[currentView]}
        </span>
      </div>
    );
  }
  
  const path = getFolderPath(currentFolderId);
  
  console.log('Breadcrumbs render:', {
    currentFolderId,
    pathLength: path.length,
    path: path.map(p => p.name)
  });
  
  // Always show at least "My Drive"
  return (
    <nav className="drive-breadcrumb px-1">
      <button
        onClick={() => setCurrentFolderId(null)}
        className="drive-breadcrumb-item flex items-center gap-1 hover:bg-secondary px-2 py-1 rounded-md"
      >
        <Home className="w-4 h-4" />
        <span>My Drive</span>
      </button>
      
      {/* Only show path if we have valid folders */}
      {path.length > 0 && path.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {index === path.length - 1 ? (
            <span className="drive-breadcrumb-current px-2 py-1">{folder.name}</span>
          ) : (
            <button
              onClick={() => setCurrentFolderId(folder.id)}
              className="drive-breadcrumb-item hover:bg-secondary px-2 py-1 rounded-md"
            >
              {folder.name}
            </button>
          )}
        </React.Fragment>
      ))}
      
      {/* If we have a folderId but couldn't build path, show placeholder */}
      {currentFolderId && path.length === 0 && (
        <>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="drive-breadcrumb-current px-2 py-1 text-muted-foreground">
            Unknown Folder
          </span>
        </>
      )}
    </nav>
  );
}