// src/pages/Profile.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Calendar, HardDrive, LogOut, 
  Settings, Shield, Bell, Globe, CreditCard,
  ChevronLeft, Camera, Check, X
} from 'lucide-react';
import { useDrive } from '../context/DriveContext';
import { formatBytes } from '../utils/formatBytes';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useDrive();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security' | 'notifications'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      // In real app: Upload to server here
    }
  };

  const handleSaveProfile = () => {
    // In real app: Save to backend
    console.log('Saving profile:', { name: editedName, avatar: avatarFile });
    setIsEditing(false);
    // Update user context
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view profile</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const storagePercentage = user.storage_used / user.storage_quota * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Drive</span>
          </button>
          <h1 className="text-xl font-semibold text-foreground">Account Settings</h1>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="drive-card p-4 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'account' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notifications' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
              
              <div className="h-px bg-border my-2"></div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Storage Info */}
            <div className="drive-card p-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Storage</span>
                <span className="text-sm text-muted-foreground">
                  {formatBytes(user.storage_used)} of {formatBytes(user.storage_quota)}
                </span>
              </div>
              <div className="drive-progress-bar">
                <div 
                  className="drive-progress-fill" 
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(storagePercentage)}% used
              </p>
              <button className="mt-3 text-sm text-primary hover:underline w-full text-left">
                <HardDrive className="w-4 h-4 inline mr-2" />
                Upgrade storage
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="drive-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(user.name || '');
                          setAvatarFile(null);
                        }}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background">
                        {avatarFile ? (
                          <img 
                            src={URL.createObjectURL(avatarFile)} 
                            alt="New avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                            <User className="w-12 h-12 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                          <Camera className="w-5 h-5 text-primary-foreground" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Profile Photo</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isEditing 
                          ? "Click the camera icon to change your photo" 
                          : "JPG, PNG or GIF, 5MB max"}
                      </p>
                    </div>
                  </div>

                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full max-w-md h-11 px-4 bg-secondary rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="text-lg text-foreground">{user.name || 'Not set'}</p>
                    )}
                  </div>

                  {/* Email Field (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <p className="text-lg text-foreground">{user.email}</p>
                      <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                        Verified
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      This is the email address you use to sign in
                    </p>
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <p className="text-lg text-foreground">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="drive-card p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Language & Region</h3>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <select className="px-4 py-2 bg-secondary rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option>English (United States)</option>
                        <option>Español</option>
                        <option>Français</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Billing</h3>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Free Plan</p>
                          <p className="text-sm text-muted-foreground">15 GB storage</p>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 text-destructive">
                      Danger Zone
                    </h3>
                    <div className="p-4 border border-destructive/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Delete Account</p>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <button className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="drive-card p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Security</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Change Password</h3>
                    <div className="space-y-4 max-w-md">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full h-11 px-4 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full h-11 px-4 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full h-11 px-4 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">2FA is disabled</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Active Sessions</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Current Session</p>
                            <p className="text-xs text-muted-foreground">
                              Chrome on Windows • {new Date().toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="drive-card p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about your account
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">File Uploads</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified when uploads complete
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Shared Files</p>
                        <p className="text-sm text-muted-foreground">
                          Notify when someone shares files with you
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}