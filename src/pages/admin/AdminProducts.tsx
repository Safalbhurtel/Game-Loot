import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../lib/types';
import { Plus, Edit2, ShieldCheck, Trash2 } from 'lucide-react';
import { OperationType, handleFirestoreError } from '../../lib/errorHandling';

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const q = query(collection(db, 'products'));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product));
    } catch (e) {
      console.error(e);
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete ${title}? This will not automatically delete its listings.`)) return;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'products', id));
      loadProducts();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'products');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold text-on-surface">Inventory</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage global product catalog</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-container transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
              <th className="p-4 pl-6 font-medium">Product Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium flex items-center gap-1">Trending</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="p-4 pl-6">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" /> : <ShieldCheck className="w-4 h-4 text-outline" />}
                     </div>
                     <span className="font-semibold text-on-surface">{p.title}</span>
                   </div>
                </td>
                <td className="p-4 text-sm text-on-surface-variant">{p.category}</td>
                <td className="p-4">
                  {p.isTrending ? (
                    <span className="px-2 py-1 rounded bg-tertiary/20 text-tertiary text-xs font-bold uppercase">Yes</span>
                  ) : (
                    <span className="px-2 py-1 text-outline text-xs">No</span>
                  )}
                </td>
                <td className="p-4 pr-6 text-right">
                  <button onClick={() => { setEditItem(p); setShowModal(true); }} className="text-on-surface-variant hover:text-primary transition-colors p-2">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id, p.title)} className="text-error/70 hover:text-error transition-colors p-2">
                     <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showModal && <ProductModal existing={editItem} onClose={() => { setShowModal(false); loadProducts(); }} />}
    </div>
  );
}

const CATEGORIES = [
  "PC Games", "Gift Cards", "Streaming", "Software", "VPN Services", "Prepaid Cards", "Game Top-ups", "Other"
];

function ProductModal({ existing, onClose }: { existing: Product | null, onClose: () => void }) {
  const [formData, setFormData] = useState({ 
    title: existing?.title || '', 
    category: existing?.category || CATEGORIES[0], 
    imageUrl: existing?.imageUrl || '', 
    description: existing?.description || '',
    seoTitle: existing?.seoTitle || '',
    seoDescription: existing?.seoDescription || '',
    isTrending: existing?.isTrending || false 
  });
  
  const [variations, setVariations] = useState<{name: string, imageUrl: string}[]>(
    existing && existing.variations && existing.variations.length > 0 
      ? existing.variations.map((v: any) => typeof v === 'string' ? { name: v, imageUrl: '' } : { name: v.name, imageUrl: v.imageUrl || '' })
      : []
  );

  const [loading, setLoading] = useState(false);

  const handleAddVariation = () => {
    if (variations.length < 5) {
      setVariations([...variations, { name: '', imageUrl: '' }]);
    }
  };

  const handleVariationChange = (index: number, field: 'name' | 'imageUrl', value: string) => {
    const newVars = [...variations];
    newVars[index][field] = value;
    setVariations(newVars);
  };

  const handleRemoveVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        title: formData.title,
        category: formData.category,
        isTrending: formData.isTrending,
      };
      if (formData.imageUrl) payload.imageUrl = formData.imageUrl;
      if (formData.description) payload.description = formData.description;
      if (formData.seoTitle) payload.seoTitle = formData.seoTitle;
      if (formData.seoDescription) payload.seoDescription = formData.seoDescription;
      
      const validVars = variations.filter(v => v.name.trim().length > 0).map(v => ({
        name: v.name.trim(),
        imageUrl: v.imageUrl.trim() || undefined
      }));
      payload.variations = validVars;

      if (existing) {
        const { updateDoc } = await import('firebase/firestore');
        payload.updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'products', existing.id), payload);
      } else {
        const id = formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        payload.createdAt = serverTimestamp();
        await setDoc(doc(db, 'products', id), payload);
      }
      onClose();
    } catch (e) {
      handleFirestoreError(e, existing ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative my-8">
        <h3 className="text-xl font-heading font-bold mb-6">{existing ? 'Edit Product' : 'Add Global Product'}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Title</label>
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Category</label>
            <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Image URL</label>
            <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface" placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Product Variations</label>
              {variations.length < 5 && (
                <button type="button" onClick={handleAddVariation} className="text-xs font-bold text-primary hover:text-primary-container px-2 py-1 rounded bg-primary/10">
                  + Add Variation
                </button>
              )}
            </div>
            {variations.length === 0 && <p className="text-xs text-on-surface-variant mb-2">No variations added. Sellers can pick from these when creating a listing.</p>}
            <div className="space-y-3">
              {variations.map((val, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 bg-surface p-3 rounded-xl border border-outline-variant/30">
                  <div className="flex-1">
                    <input required value={val.name} onChange={e => handleVariationChange(idx, 'name', e.target.value)} className="w-full bg-surface-container-low text-sm rounded-lg px-4 py-2 border border-outline-variant/30 focus:border-primary/50 text-on-surface" placeholder="Variation Name (e.g. Standard Edition)" />
                  </div>
                  <div className="flex-1">
                    <input value={val.imageUrl} onChange={e => handleVariationChange(idx, 'imageUrl', e.target.value)} className="w-full bg-surface-container-low text-sm rounded-lg px-4 py-2 border border-outline-variant/30 focus:border-primary/50 text-on-surface" placeholder="Image URL (Optional)" />
                  </div>
                  <button type="button" onClick={() => handleRemoveVariation(idx)} className="text-error hover:text-error-container p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-outline-variant/20 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <h4 className="font-bold text-sm text-on-surface mb-4">SEO Settings</h4>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">SEO Title</label>
            <input value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface" placeholder="Title for Google Search" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">SEO Description</label>
            <textarea value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} rows={2} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface" placeholder="Description for Google Search"></textarea>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <input type="checkbox" checked={formData.isTrending} onChange={e => setFormData({...formData, isTrending: e.target.checked})} className="w-4 h-4 bg-surface border-outline-variant/30 rounded focus:ring-primary text-primary" />
          <label className="text-sm font-medium text-on-surface">Mark as Trending Deal</label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary-container transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : (existing ? 'Save Changes' : 'Save Product')}
          </button>
        </div>
      </form>
    </div>
  );
}
