import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

interface UploadDropzoneProps {
  children: React.ReactNode;
}

export function UploadDropzone({ children }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const { uploadFiles, currentView } = useDrive();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentView === 'trash') return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, [currentView]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (currentView === 'trash') return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      uploadFiles(files);
    }
  }, [uploadFiles, currentView]);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="relative flex-1 min-h-0"
    >
      {children}
      
      {isDragActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="drive-dropzone drive-dropzone-active p-12 text-center">
            <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Drop files here
            </h3>
            <p className="text-muted-foreground">
              Release to upload your files
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function UploadProgressBar() {
  const { uploadProgress } = useDrive();

  if (uploadProgress.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
      <div className="px-4 py-3 bg-secondary/50 border-b border-border flex items-center justify-between">
        <span className="font-medium text-foreground">Uploading files</span>
        <span className="text-sm text-muted-foreground">
          {uploadProgress.filter(u => u.status === 'completed').length} / {uploadProgress.length}
        </span>
      </div>
      
      <div className="max-h-60 overflow-y-auto scrollbar-thin">
        {uploadProgress.map((upload) => (
          <div key={upload.id} className="px-4 py-3 border-b border-border last:border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground truncate flex-1 mr-2">
                {upload.fileName}
              </span>
              {upload.status === 'completed' ? (
                <span className="text-xs text-success font-medium">Done</span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {Math.round(upload.progress)}%
                </span>
              )}
            </div>
            <div className="drive-progress-bar">
              <div 
                className="drive-progress-fill"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
