import React, { useState } from 'react';
import { useAuthStore } from '../../lib/store';
import { ShieldCheck, Copy, Edit2, Check, X, Camera } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../../lib/firebase';
import { OperationType, handleFirestoreError } from '../../lib/errorHandling';

export function ProfilePage() {
  const { profile, user, setProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    photoURL: (profile as any)?.photoURL || user?.photoURL || ''
  });
  const [loading, setLoading] = useState(false);

  // Initialize form when profile changes
  React.useEffect(() => {
    if (profile || user) {
       setFormData({
         displayName: profile?.displayName || user?.displayName || '',
         photoURL: (profile as any)?.photoURL || user?.photoURL || ''
       });
    }
  }, [profile, user]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // 1. Update Firestore profile doc
      const userRef = doc(db, 'users', user.uid);
      const payload: any = {
        displayName: formData.displayName,
        updatedAt: serverTimestamp()
      };
      if (formData.photoURL) payload.photoURL = formData.photoURL;
      
      await updateDoc(userRef, payload);
      
      // 2. Update Firebase Auth Profile (Optional but good for consistency)
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: formData.photoURL || user.photoURL
      });

      // 3. Update local state
      setProfile({
        ...profile!,
        displayName: formData.displayName,
        photoURL: formData.photoURL
      } as any);

      setIsEditing(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users');
    }
    setLoading(false);
  };

  if (!user || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
         <ShieldCheck className="w-16 h-16 text-primary opacity-50" />
         <p className="text-on-surface-variant font-medium">Please log in to view your profile.</p>
      </div>
    );
  }

  const currentPhotoURL = (profile as any)?.photoURL || user.photoURL;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">My Profile</h1>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-6 md:p-10 shadow-sm relative">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          <div className="relative group">
            {currentPhotoURL ? (
              <img src={currentPhotoURL} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-surface shadow-md" />
            ) : (
              <div className="w-28 h-28 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl font-heading font-bold border-4 border-surface shadow-md">
                {profile.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-full shadow-lg hover:scale-105 transition-transform"
                title="Edit Profile"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-bold text-on-surface">{profile.displayName || 'Anonymous User'}</h2>
            <p className="text-on-surface-variant font-medium">{user.email}</p>
            
            <div className="flex flex-wrap gap-2 pt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                profile.role === 'admin' ? 'bg-error/10 text-error border border-error/20' :
                profile.role === 'seller' ? 'bg-secondary/10 text-secondary border border-secondary/20' :
                'bg-primary/10 text-primary border border-primary/20'
              }`}>
                 {profile.role}
              </span>
              {user.emailVerified && (
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
          </div>
          
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-sm font-semibold hover:bg-surface-container-high hover:border-primary/50 transition-all flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>

        {isEditing && (
          <form onSubmit={handleSave} className="mt-8 pt-8 border-t border-outline-variant/20 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-bold">Edit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={formData.displayName} 
                  onChange={e => setFormData({...formData, displayName: e.target.value})} 
                  className="w-full bg-surface text-sm rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" 
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Profile Image URL</label>
                <input 
                  type="url" 
                  value={formData.photoURL} 
                  onChange={e => setFormData({...formData, photoURL: e.target.value})} 
                  className="w-full bg-surface text-sm rounded-xl px-4 py-3 border border-outline-variant/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" 
                  placeholder="https://example.com/avatar.png"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                     displayName: profile?.displayName || user?.displayName || '',
                     photoURL: (profile as any)?.photoURL || user?.photoURL || ''
                  });
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:bg-primary-container shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-outline-variant/20 space-y-4">
          <h3 className="font-bold text-lg">System Information</h3>
          
          <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/10">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Firebase UID (Owner ID)</label>
            <div className="flex items-center gap-3">
              <code className="bg-surface px-4 py-2.5 rounded-xl flex-1 text-sm text-primary font-mono select-all border border-outline-variant/20 shadow-inner">
                {user.uid}
              </code>
              <button 
                onClick={() => handleCopy(user.uid)}
                className="p-2.5 bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 rounded-xl transition-all shadow-sm"
                title="Copy UID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-medium text-on-surface-variant/70 mt-3">This is your unique identifier. Provide this UID when requesting seller verification or opening a support ticket.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
