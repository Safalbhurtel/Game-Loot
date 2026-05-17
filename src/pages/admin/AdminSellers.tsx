import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Seller } from '../../lib/types';
import { Plus, Edit2, ShieldCheck, ShieldAlert, Trash2, Ban } from 'lucide-react';
import { OperationType, handleFirestoreError } from '../../lib/errorHandling';

export function AdminSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Seller | null>(null);

  useEffect(() => {
    loadSellers();
  }, []);

  async function loadSellers() {
    try {
      const q = query(collection(db, 'sellers'));
      const snap = await getDocs(q);
      setSellers(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Seller));
    } catch (e) {
      console.error(e);
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to ban/delete the seller ${name}?`)) return;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'sellers', id));
      loadSellers();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'sellers');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold text-on-surface">Platform Sellers</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage verified sellers and trust scores</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-container transition-colors">
          <Plus className="w-4 h-4" /> Add Seller
        </button>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
              <th className="p-4 pl-6 font-medium">Seller Name</th>
              <th className="p-4 font-medium">Trust Score</th>
              <th className="p-4 font-medium flex items-center gap-1">Status</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {sellers.map((s) => (
              <tr key={s.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="p-4 pl-6 font-semibold text-on-surface flex items-center gap-3">
                  {s.logoUrl ? (
                    <img src={s.logoUrl} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-outline-variant/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold">{s.name.charAt(0)}</div>
                  )}
                  {s.name}
                </td>
                <td className="p-4 text-sm font-bold text-tertiary">★ {s.trustScore.toFixed(1)}</td>
                <td className="p-4">
                  {s.isVerified ? (
                    <span className="px-2 py-1 rounded bg-primary/20 text-primary flex items-center gap-1 w-max text-xs font-bold uppercase">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-error/20 text-error flex items-center gap-1 w-max text-xs font-bold uppercase">
                      <ShieldAlert className="w-3 h-3" /> Unverified
                    </span>
                  )}
                </td>
                <td className="p-4 pr-6 text-right">
                  <button onClick={() => { setEditItem(s); setShowModal(true); }} className="text-on-surface-variant hover:text-primary transition-colors p-2" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id, s.name)} className="text-error/70 hover:text-error transition-colors p-2" title="Ban / Delete">
                     <Ban className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showModal && <SellerModal existing={editItem} onClose={() => { setShowModal(false); loadSellers(); }} />}
    </div>
  );
}

function SellerModal({ existing, onClose }: { existing: Seller | null, onClose: () => void }) {
  const [formData, setFormData] = useState({ 
    name: existing?.name || '', 
    ownerId: existing?.ownerId || '', 
    trustScore: existing?.trustScore || 0, 
    logoUrl: existing?.logoUrl || '',
    storeUrl: existing?.storeUrl || '',
    isVerified: existing?.isVerified || false 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (existing) {
        const { updateDoc } = await import('firebase/firestore');
        const payload: any = {
          name: formData.name,
          trustScore: Number(formData.trustScore),
          isVerified: formData.isVerified,
          updatedAt: serverTimestamp()
        };
        if (formData.logoUrl) payload.logoUrl = formData.logoUrl;
        if (formData.storeUrl) payload.storeUrl = formData.storeUrl;
        await updateDoc(doc(db, 'sellers', existing.id), payload);
      } else {
        const id = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const payload: any = {
           name: formData.name,
           ownerId: formData.ownerId,
           trustScore: Number(formData.trustScore),
           isVerified: formData.isVerified,
           createdAt: serverTimestamp()
        };
        if (formData.logoUrl) payload.logoUrl = formData.logoUrl;
        if (formData.storeUrl) payload.storeUrl = formData.storeUrl;
        await setDoc(doc(db, 'sellers', id), payload);
        
        // Attempt to upgrade user role when seller is created
        try {
           if (formData.ownerId) {
             const { updateDoc } = await import('firebase/firestore');
             await updateDoc(doc(db, 'users', formData.ownerId), {
               role: 'seller',
               updatedAt: serverTimestamp()
             });
           }
        } catch (roleError) {
           console.error('Could not upgrade user role', roleError);
        }
      }
      onClose();
    } catch (e) {
      handleFirestoreError(e, existing ? OperationType.UPDATE : OperationType.CREATE, 'sellers');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 w-full max-w-md shadow-2xl relative my-8">
        <h3 className="text-xl font-heading font-bold mb-6">{existing ? 'Edit Seller' : 'Register Seller'}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Seller Display Name</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" />
          </div>
          {!existing && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Owner UID (Firebase Auth ID)</label>
              <input required value={formData.ownerId} onChange={e => setFormData({...formData, ownerId: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" placeholder="e.g. jX9o..." />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Logo URL</label>
            <input type="url" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" placeholder="https://example.com/logo.png" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Primary Store URL</label>
            <input type="url" value={formData.storeUrl} onChange={e => setFormData({...formData, storeUrl: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" placeholder="https://facebook.com/myshop" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Trust Score (0-5)</label>
            <input type="number" step="0.1" min="0" max="5" required value={formData.trustScore} onChange={e => setFormData({...formData, trustScore: Number(e.target.value)})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <input type="checkbox" checked={formData.isVerified} onChange={e => setFormData({...formData, isVerified: e.target.checked})} className="w-4 h-4 bg-surface border-outline-variant/30 rounded focus:ring-primary text-primary" />
            <label className="text-sm font-medium text-on-surface">Mark as Verified Seller</label>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary-container transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : (existing ? 'Save Changes' : 'Register Seller')}
          </button>
        </div>
      </form>
    </div>
  );
}
