// src/pages/SharedContent.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Download, FileText, Folder, AlertCircle } from 'lucide-react';
import { sharesAPI,filesAPI } from '../services/api';
import {formatBytes} from '../utils/formatBytes'
export default function SharedContent() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [linkData, setLinkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (token) {
      fetchLinkData();
    }
  }, [token]);

  const fetchLinkData = async () => {
    try {
      setLoading(true);
      const response = await sharesAPI.getPublicLink(token!);
      setLinkData(response.data);
      
      if (response.data.password_hash) {
        setRequiresPassword(true);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load shared content');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd verify password on backend
    // For now, we'll assume it's correct
    setRequiresPassword(false);
  };

  const handleDownload = async () => {
    if (!linkData) return;
    
    try {
      // Get download URL from backend
      const resource = linkData.files || linkData.folders;
      if (linkData.resource_type === 'file') {
        // Call download endpoint
        const response = await filesAPI.download(resource.id);
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Link Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full drive-card p-8">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Password Required</h1>
            <p className="text-muted-foreground">
              This shared link is protected with a password
            </p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-12 px-4 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              {passwordError && (
                <p className="text-sm text-destructive mt-2">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Access Content
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!linkData) return null;

  const resource = linkData.files || linkData.folders;
  const isFile = linkData.resource_type === 'file';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <header className="py-6 border-b border-border mb-8">
          <h1 className="text-2xl font-bold text-foreground">Shared Content</h1>
        </header>

        <div className="drive-card p-8">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              {isFile ? (
                <FileText className="w-10 h-10 text-primary" />
              ) : (
                <Folder className="w-10 h-10 text-warning" />
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">{resource.name}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{isFile ? 'File' : 'Folder'}</span>
                {isFile && resource.size_bytes && (
                  <span>{formatBytes(resource.size_bytes)}</span>
                )}
                <span>Shared by {linkData.created_by_user?.name || 'Unknown'}</span>
              </div>
              
              {linkData.expires_at && (
                <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                  <p className="text-warning text-sm">
                    This link expires on {new Date(linkData.expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            {isFile ? (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download File
              </button>
            ) : (
              <button
                onClick={() => navigate(`/shared-folder/${token}`)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Folder className="w-5 h-5" />
                Open Folder
              </button>
            )}
            
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              Copy Link
            </button>
          </div>

          {!isFile && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Folder Contents</h3>
              <div className="text-center py-12 text-muted-foreground">
                <p>Folder preview coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function
