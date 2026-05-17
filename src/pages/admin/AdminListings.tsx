import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Listing, Product, Seller } from '../../lib/types';
import { Edit2, Zap, Trash2 } from 'lucide-react';
import { OperationType, handleFirestoreError } from '../../lib/errorHandling';

export function AdminListings() {
  const [listings, setListings] = useState<(Listing & { product?: Product, seller?: Seller })[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Listing | null>(null);

  const loadListings = async () => {
    try {
      const lq = query(collection(db, 'listings'));
      const lSnap = await getDocs(lq);
      
      const allProductsQ = query(collection(db, 'products'));
      const allProductsSnap = await getDocs(allProductsQ);
      const prds = allProductsSnap.docs.map(d => ({id: d.id, ...d.data()} as Product));
      
      const allSellersQ = query(collection(db, 'sellers'));
      const allSellersSnap = await getDocs(allSellersQ);
      const sellers = allSellersSnap.docs.map(d => ({id: d.id, ...d.data()} as Seller));

      setListings(lSnap.docs.map(d => {
        const data = d.data() as Listing;
        return {
          id: d.id,
          ...data,
          product: prds.find(p => p.id === data.productId),
          seller: sellers.find(s => s.id === data.sellerId),
        };
      }));
    } catch(e) {
       console.error(e);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteDoc(doc(db, 'listings', id));
      loadListings();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'listings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold text-on-surface">Platform Listings</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage all seller listings globally.</p>
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
              <th className="p-4 pl-6 font-medium">Product / Variation</th>
              <th className="p-4 font-medium">Seller</th>
              <th className="p-4 font-medium">Price (NPR)</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Status / Delivery</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {listings.map(l => (
              <tr key={l.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="p-4 pl-6 font-medium text-on-surface">
                  {l.product?.title || 'Unknown Product'}
                  {l.variation && <div className="text-xs text-on-surface-variant">{l.variation}</div>}
                </td>
                <td className="p-4 text-sm text-on-surface-variant">{l.seller?.name || l.sellerId}</td>
                <td className="p-4 font-bold text-primary">Rs. {l.price.toLocaleString()}</td>
                <td className="p-4 text-sm">{l.stock} units</td>
                <td className="p-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded w-max text-[10px] uppercase font-bold tracking-wider ${l.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-outline'}`}>
                      {l.status}
                    </span>
                    {l.isInstantDelivery && <span className="text-[10px] text-secondary flex items-center gap-1 font-semibold uppercase"><Zap className="w-3 h-3"/> Instant</span>}
                  </div>
                </td>
                <td className="p-4 pr-6 text-right">
                  <button onClick={() => { setEditItem(l); setShowModal(true); }} className="text-on-surface-variant hover:text-primary transition-colors p-2">
                     <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(l.id)} className="text-error/70 hover:text-error transition-colors p-2">
                     <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {listings.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">There are currently no listings.</div>
        )}
      </div>

      {showModal && editItem && (
        <AdminListingModal 
          existing={editItem} 
          onClose={() => { setShowModal(false); loadListings(); }} 
        />
      )}
    </div>
  );
}

function AdminListingModal({ existing, onClose }: { existing: Listing, onClose: () => void }) {
  const [formData, setFormData] = useState({
    price: existing.price.toString() || '0',
    originalPrice: existing.originalPrice?.toString() || '',
    stock: existing.stock.toString() || '0',
    status: existing.status,
    isInstantDelivery: existing.isInstantDelivery || false,
    paymentMethods: existing.paymentMethods || ['eSewa'],
    region: existing.region || 'Global',
    platform: existing.platform || 'PC',
    exactLink: existing.exactLink || '',
    discount: existing.discount || '',
    couponCode: existing.couponCode || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        status: formData.status,
        isInstantDelivery: formData.isInstantDelivery,
        paymentMethods: formData.paymentMethods,
        region: formData.region,
        platform: formData.platform,
        updatedAt: serverTimestamp()
      };
      if (formData.originalPrice !== '' && formData.originalPrice !== null) {
        payload.originalPrice = Number(formData.originalPrice);
      } else {
        payload.originalPrice = null;
      }
      if (formData.exactLink) payload.exactLink = formData.exactLink;
      else payload.exactLink = null;
      if (formData.discount) payload.discount = formData.discount;
      else payload.discount = null;
      if (formData.couponCode) payload.couponCode = formData.couponCode;
      else payload.couponCode = null;
      
      await updateDoc(doc(db, 'listings', existing.id), payload);
      onClose();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'listings');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative my-8">
        <h3 className="text-xl font-heading font-bold mb-6">Edit Listing (Admin)</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Price (NPR)</label>
              <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface" />
            </div>
            <div>
               <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Orig. Price</label>
               <input type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Stock</label>
              <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface" />
            </div>
            <div>
               <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Status</label>
               <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface">
                 <option value="active">Active</option>
                 <option value="inactive">Inactive</option>
               </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Payment Methods</label>
            <div className="flex flex-wrap gap-3">
              {['eSewa', 'Khalti', 'IME Pay', 'Bank Transfer', 'Fonepay'].map(pm => (
                <label key={pm} className="flex items-center gap-2 cursor-pointer bg-surface px-3 py-2 rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors">
                  <input type="checkbox" checked={Array.isArray(formData.paymentMethods) ? formData.paymentMethods.includes(pm) : false} onChange={e => {
                    const current = Array.isArray(formData.paymentMethods) ? formData.paymentMethods : [];
                    if (e.target.checked) setFormData({...formData, paymentMethods: [...current, pm]});
                    else setFormData({...formData, paymentMethods: current.filter(x => x !== pm)});
                  }} className="w-4 h-4 bg-surface text-primary focus:ring-primary rounded border-outline-variant/30" />
                  <span className="text-sm font-medium text-on-surface">{pm}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Exact Store Link (Optional)</label>
            <input type="url" value={formData.exactLink} onChange={e => setFormData({...formData, exactLink: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface" placeholder="https://yourstore.com/product/..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Discount (Optional)</label>
              <input type="text" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface" placeholder="10% or Rs.500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Coupon Code (Optional)</label>
              <input type="text" value={formData.couponCode} onChange={e => setFormData({...formData, couponCode: e.target.value})} className="w-full bg-surface text-sm rounded-lg px-4 py-2.5 border border-outline-variant/30 focus:border-primary/50 text-on-surface" placeholder="WINTER25" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <input type="checkbox" checked={formData.isInstantDelivery} onChange={e => setFormData({...formData, isInstantDelivery: e.target.checked})} className="w-4 h-4 bg-surface border-outline-variant/30 rounded focus:ring-primary text-primary" />
            <label className="text-sm font-medium text-on-surface">Instant Delivery Supported</label>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary-container transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
