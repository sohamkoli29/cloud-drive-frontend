import React from 'react';
import { 
  Image, 
  FileText, 
  File, 
  Film, 
  Music, 
  Archive, 
  FileSpreadsheet,
  Folder as FolderIcon 
} from 'lucide-react';
import { FileType } from '../../types/drive';

interface FileIconProps {
  type: FileType | 'folder';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap: Record<FileType | 'folder', React.ElementType> = {
  image: Image,
  pdf: FileText,
  doc: File,
  spreadsheet: FileSpreadsheet,
  video: Film,
  audio: Music,
  archive: Archive,
  default: File,
  folder: FolderIcon,
};

const colorMap: Record<FileType | 'folder', string> = {
  image: 'text-file-image bg-file-image/10',
  pdf: 'text-file-pdf bg-file-pdf/10',
  doc: 'text-file-doc bg-file-doc/10',
  spreadsheet: 'text-file-spreadsheet bg-file-spreadsheet/10',
  video: 'text-file-video bg-file-video/10',
  audio: 'text-file-audio bg-file-audio/10',
  archive: 'text-file-archive bg-file-archive/10',
  default: 'text-file-default bg-file-default/10',
  folder: 'text-warning bg-warning/10',
};

const sizeMap = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-14 h-14', icon: 'w-7 h-7' },
};

export function FileIcon({ type, size = 'md', className = '' }: FileIconProps) {
  const Icon = iconMap[type];
  const colors = colorMap[type];
  const sizes = sizeMap[size];

  return (
    <div 
      className={`${sizes.container} rounded-xl flex items-center justify-center ${colors} ${className}`}
    >
      <Icon className={sizes.icon} />
    </div>
  );
}
