import React from 'react';
import { 
  Search, 
  Grid3X3, 
  List, 
  ChevronDown,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { SortBy, FilterType } from '../../types/drive';
import { mockUser } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
export function Topbar() {
  const { 
    viewMode, 
    setViewMode, 
    sortConfig, 
    setSortConfig,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery 
  } = useDrive();
   const navigate = useNavigate();
  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date modified' },
    { value: 'size', label: 'File size' },
  ];

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All types' },
    { value: 'images', label: 'Images' },
    { value: 'pdfs', label: 'PDFs' },
    { value: 'docs', label: 'Documents' },
    { value: 'videos', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
  ];

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 gap-4">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search in Drive"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-secondary rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all duration-200"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Filter Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
            <span>{filterOptions.find(f => f.value === filterType)?.label}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute top-full right-0 mt-1 py-1 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-36">
            {filterOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors ${
                  filterType === value ? 'text-primary font-medium' : 'text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
            <span>Sort: {sortOptions.find(s => s.value === sortConfig.by)?.label}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute top-full right-0 mt-1 py-1 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-40">
            {sortOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSortConfig({ 
                  by: value, 
                  order: sortConfig.by === value && sortConfig.order === 'asc' ? 'desc' : 'asc' 
                })}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors flex items-center justify-between ${
                  sortConfig.by === value ? 'text-primary font-medium' : 'text-foreground'
                }`}
              >
                {label}
                {sortConfig.by === value && (
                  <span className="text-xs">{sortConfig.order === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-secondary rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Action Buttons */}
        <button className="drive-icon-button text-muted-foreground hover:text-foreground">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="drive-icon-button text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        <button 
        onClick={() => navigate('/profile')}
        className="ml-2 w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all"
      >
        <img 
          src={mockUser.avatar} 
          alt={mockUser.name}
          className="w-full h-full object-cover"
        />
      </button>
      </div>
    </header>
  );
}
