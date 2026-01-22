// In src/components/drive/modals/ShareModal.tsx
import React, { useState } from 'react';
import { X, Share2, Link, Copy, Check, Trash2, Users } from 'lucide-react';
import { useDrive } from '../../../context/DriveContext';
import { DriveFile, SharedUser } from '../../../types/drive';
import { sharesAPI } from '../../../services/api'; // Add this import

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: DriveFile | null;
}

export function ShareModal({ isOpen, onClose, file }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [isSharing, setIsSharing] = useState(false);
  const [showPublicLink, setShowPublicLink] = useState(false);
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [linkPassword, setLinkPassword] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  
  const { shareFile, removeShare, generatePublicLink, addToast, files, refreshData } = useDrive(); // Add refreshData from context

  // Get the latest file data
  const currentFile = file ? files.find(f => f.id === file.id) : null;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !file) return;
    
    setIsSharing(true);
    try {
      console.log('📤 Sharing file:', {
        fileId: file.id,
        fileName: file.name,
        email: email.trim(),
        role
      });
      
      await shareFile(file.id, { 
        email: email.trim(), 
        role,
        name: email.split('@')[0] 
      });
      
      setEmail('');
      addToast(`Shared with ${email}`, 'success');
    } catch (error) {
      console.error('Share failed:', error);
      // Don't add toast here - shareFile already handles it
    } finally {
      setIsSharing(false);
    }
  };

  // If you still need a standalone searchUserByEmail function, add this:
  const searchUserByEmail = async (email: string) => {
    try {
      console.log('🔍 Searching user by email:', email);
      
      const response = await sharesAPI.searchUser(email);
      console.log('✅ searchUserByEmail response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ searchUserByEmail error details:', {
        email,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Check for specific error message
      if (error.response?.data?.error?.includes('User with this email not found')) {
        throw new Error('User not found. Please ask them to create an account first.');
      }
      
      throw error;
    }
  };

  const handleRemoveAccess = async (userEmail: string) => {
    if (!file) return;
    try {
      await removeShare(file.id, userEmail);
      addToast('Access removed', 'success');
    } catch (error) {
      console.error('Remove access failed:', error);
    }
  };

  const handleGenerateLink = async () => {
    if (!file) return;
    try {
      const link = await generatePublicLink(file.id, expiryDays, linkPassword || undefined);
      setGeneratedLink(link);
      addToast('Link generated', 'success');
    } catch (error) {
      console.error('Generate link failed:', error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setPublicLinkCopied(true);
    addToast('Link copied to clipboard', 'success');
    setTimeout(() => setPublicLinkCopied(false), 2000);
  };

  if (!isOpen || !file || !currentFile) return null;

  return (
    <div className="drive-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="drive-modal animate-scale-in max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Share "{file.name}"</h2>
              <p className="text-sm text-muted-foreground">Manage access and sharing settings</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Add People */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Add people
            </h3>
            <form onSubmit={handleShare} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 h-10 px-3 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
                className="h-10 px-3 bg-secondary rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button
                type="submit"
                disabled={!email.trim() || isSharing}
                className="px-4 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSharing ? '...' : 'Add'}
              </button>
            </form>
          </div>

          {/* Shared Users */}
          {currentFile.sharedWith.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">People with access</h3>
              <div className="space-y-2">
                {currentFile.sharedWith.map((user) => (
                  <div 
                    key={user.email}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name || user.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAccess(user.email)}
                      className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Link */}
          <div>
            <button
              onClick={() => setShowPublicLink(!showPublicLink)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Link className="w-4 h-4" />
              {showPublicLink ? 'Hide public link options' : 'Get shareable link'}
            </button>
            
            {showPublicLink && (
              <div className="mt-4 p-4 bg-secondary/50 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-2">
                      Link expires in
                    </label>
                    <select
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(Number(e.target.value))}
                      className="w-full h-9 px-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    >
                      <option value={1}>1 day</option>
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-2">
                      Password (optional)
                    </label>
                    <input
                      type="password"
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      placeholder="Set password"
                      className="w-full h-9 px-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleGenerateLink}
                  className="w-full h-10 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium text-sm"
                >
                  Generate Link
                </button>
                
                {generatedLink && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 h-10 px-3 bg-card border border-border rounded-lg text-foreground text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      {publicLinkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}