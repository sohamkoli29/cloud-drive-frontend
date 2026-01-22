import React from 'react';
import { 
  HardDrive, 
  Users, 
  Star, 
  Clock, 
  Trash2, 
  Plus,
  Cloud
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { DriveView } from '../../types/drive';

interface SidebarProps {
  onNewClick: () => void;
}

const navItems: { id: DriveView; label: string; icon: React.ElementType }[] = [
  { id: 'my-drive', label: 'My Drive', icon: HardDrive },
  { id: 'shared', label: 'Shared with me', icon: Users },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

export function Sidebar({ onNewClick }: SidebarProps) {
  const { currentView, setCurrentView, setCurrentFolderId } = useDrive();

  const handleNavClick = (view: DriveView) => {
    setCurrentView(view);
    if (view !== 'my-drive') {
      setCurrentFolderId(null);
    }
  };

  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
          <Cloud className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground">CloudDrive</span>
      </div>

      {/* New Button */}
      <div className="px-3 py-2">
        <button
          onClick={onNewClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-full bg-card border border-border shadow-md hover:shadow-lg transition-all duration-200 text-foreground font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>New</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleNavClick(id)}
            className={`drive-sidebar-item w-full ${
              currentView === id
                ? 'drive-sidebar-item-active'
                : 'drive-sidebar-item-inactive'
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Storage Indicator */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Storage</span>
          <span className="font-medium text-foreground">4.2 GB of 15 GB</span>
        </div>
        <div className="drive-progress-bar">
          <div className="drive-progress-fill" style={{ width: '28%' }} />
        </div>
        <button className="mt-3 text-sm text-primary hover:underline">
          Get more storage
        </button>
      </div>
    </aside>
  );
}
