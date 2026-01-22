import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

export function ToastContainer() {
  const { toasts, removeToast } = useDrive();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="drive-toast animate-slide-in-right flex items-start gap-3"
        >
          {toast.type === 'success' && (
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          )}
          
          <p className="flex-1 text-sm text-foreground">{toast.message}</p>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-full hover:bg-secondary transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}
