import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy, addDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Listing, Seller } from '../lib/types';
import { ShieldCheck, Zap, Globe, Clock, ArrowRight, ExternalLink, Bell, X } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts'; // for price history

function DealAlertsModal({ isOpen, onClose, productId }: { isOpen: boolean; onClose: () => void; productId: string }) {
  const [email, setEmail] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await addDoc(collection(db, 'alerts'), {
        email,
        productId,
        targetPrice: price ? parseFloat(price) : 0,
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-outline-variant/30 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
             <Bell className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-heading font-bold">Deal Alerts</h2>
        </div>
        <p className="text-sm text-on-surface-variant mb-6">
          Get notified instantly when the price drops below your target or when a new deal is available.
        </p>

        {status === 'success' ? (
          <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl text-center font-medium">
            Alert set successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Target Price (NPR)</label>
              <input
                type="number"
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                placeholder="Leave blank for any drop"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
            {status === 'error' && <p className="text-error text-sm">Failed to set alert. Please try again.</p>}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-semibold hover:bg-primary-container transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Setting Alert...' : 'Notify Me'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [listings, setListings] = useState<(Listing & { seller?: Seller })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const viewTracked = useRef(false);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        const pdRef = doc(db, 'products', id);
        const pdSnap = await getDoc(pdRef);
        if (pdSnap.exists()) {
          const pdData = { id: pdSnap.id, ...pdSnap.data() } as Product;
          setProduct(pdData);
          if (pdData.variations && pdData.variations.length > 0) {
            const firstVar = pdData.variations[0];
            setSelectedVariation(typeof firstVar === 'string' ? firstVar : firstVar.name);
          }
          
          if (!viewTracked.current) {
            viewTracked.current = true;
            try {
              await updateDoc(pdRef, { viewCount: increment(1) });
            } catch (ignore) {}
          }
        }

        const lq = query(collection(db, 'listings'), where('productId', '==', id), where('status', '==', 'active'), orderBy('price', 'asc'));
        const lSnap = await getDocs(lq);
        
        const listingsData = [];
        for (const docSnap of lSnap.docs) {
          const listing = { id: docSnap.id, ...docSnap.data() } as Listing;
          const sellerRef = doc(db, 'sellers', listing.sellerId);
          const sellerSnap = await getDoc(sellerRef);
          listingsData.push({ ...listing, seller: sellerSnap.exists() ? { id: sellerSnap.id, ...sellerSnap.data() } as Seller : undefined });
        }
        setListings(listingsData);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-64 bg-surface-container rounded-2xl"></div>
      <div className="h-96 bg-surface-container rounded-2xl"></div>
    </div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-on-surface-variant">Product not found.</div>;
  }

  // Filter listings by selected variation if applicable
  const filteredListings = selectedVariation 
    ? listings.filter(l => l.variation === selectedVariation || (!l.variation && product.variations?.length === 0))
    : listings;

  // Determine current image 
  let currentImageUrl = product.imageUrl;
  if (selectedVariation && product.variations) {
    const matchedVar = product.variations.find(v => (typeof v === 'string' ? v : v.name) === selectedVariation);
    if (matchedVar && typeof matchedVar !== 'string' && matchedVar.imageUrl) {
      currentImageUrl = matchedVar.imageUrl;
    }
  }

  // 6 months mock data
  const basePrice = filteredListings[0]?.price || 4000;
  const mockHistoryData = [
    { name: 'Nov', price: basePrice + 800 },
    { name: 'Dec', price: basePrice + 500 },
    { name: 'Jan', price: basePrice + 500 },
    { name: 'Feb', price: basePrice + 200 },
    { name: 'Mar', price: basePrice + 100 },
    { name: 'Apr', price: basePrice },
  ];

  return (
    <div className="space-y-8">
      <DealAlertsModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} productId={product.id || ''} />
      {/* Product Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 h-[400px] bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          {currentImageUrl && (
            <img src={currentImageUrl} alt={product.title} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-lg mix-blend-screen transition-all duration-500" />
          )}
          <div className="relative z-10 flex items-center justify-center h-full">
             {currentImageUrl ? (
               <img src={currentImageUrl} alt={product.title} className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl transition-all duration-500" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-outline">No visual</div>
             )}
          </div>
        </div>
        
        <div className="lg:col-span-8 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl md:text-5xl font-heading font-bold">{product.title}</h1>
            <button 
              onClick={() => setIsAlertModalOpen(true)}
              className="bg-surface-container-high hover:bg-surface-container-highest transition-colors border border-outline-variant/30 text-on-surface font-semibold px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap"
            >
              <Bell className="w-4 h-4 text-primary" /> Notify Me
            </button>
          </div>
          <p className="text-on-surface-variant text-lg max-w-3xl leading-relaxed mb-6">
            {product.description || "Unlock premium perks, exclusive items, and more. Compare the best prices available in Nepal below."}
          </p>

          {/* Variations Selector */}
          {product.variations && product.variations.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Select Edition / Platform</p>
              <div className="flex flex-wrap gap-3">
                {product.variations.map((v, idx) => {
                  const varName = typeof v === 'string' ? v : v.name;
                  const isSelected = selectedVariation === varName;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariation(varName)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${isSelected ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50 hover:text-on-surface'}`}
                    >
                      {varName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Quick Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-xl flex items-center gap-3">
              <Globe className="w-5 h-5 text-tertiary" />
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-0.5">Region</p>
                <p className="text-sm font-semibold text-on-surface">Global</p>
              </div>
            </div>
            <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-xl flex items-center gap-3">
              <Zap className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-0.5">Delivery</p>
                <p className="text-sm font-semibold text-on-surface">Instant</p>
              </div>
            </div>
            <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-xl flex items-center gap-3">
              <PackageIcon className="w-5 h-5 text-outline" />
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-0.5">Type</p>
                <p className="text-sm font-semibold text-on-surface">Digital Key</p>
              </div>
            </div>
            <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-0.5">Platform</p>
                <p className="text-sm font-semibold text-on-surface">{product.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Comparison */}
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h2 className="text-xl font-heading font-bold">Seller Comparison</h2>
           <p className="text-xs text-on-surface-variant font-medium">Sorted by: <span className="text-primary font-bold">Best Price</span></p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-xs font-semibold tracking-wider uppercase">
                <th className="p-4 pl-6 font-medium">Seller</th>
                <th className="p-4 font-medium">Trust Score</th>
                <th className="p-4 font-medium">Delivery</th>
                <th className="p-4 font-medium">Payments / Offers</th>
                <th className="p-4 font-medium text-right">Price (NPR)</th>
                <th className="p-4 pr-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    No active listings available for this variation.
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing, idx) => (
                  <tr key={listing.id} className={`hover:bg-surface-container/50 transition-colors ${idx === 0 ? 'bg-primary/5' : ''}`}>
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        {listing.seller?.storeUrl ? (
                          <a href={listing.seller.storeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            {listing.seller?.logoUrl ? (
                              <img src={listing.seller.logoUrl} alt={listing.seller.name} className="w-8 h-8 rounded-full border border-outline-variant/30 object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-on-surface">
                                {listing.seller?.name.charAt(0) || '?'}
                              </div>
                            )}
                          </a>
                        ) : (
                          <>
                            {listing.seller?.logoUrl ? (
                              <img src={listing.seller.logoUrl} alt={listing.seller.name} className="w-8 h-8 rounded-full border border-outline-variant/30 object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-on-surface">
                                {listing.seller?.name.charAt(0) || '?'}
                              </div>
                            )}
                          </>
                        )}
                        <div>
                          {listing.seller?.storeUrl ? (
                            <a href={listing.seller.storeUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-on-surface flex items-center gap-1.5 hover:text-primary transition-colors">
                              {listing.seller?.name || 'Unknown Seller'}
                              {listing.seller?.isVerified && <ShieldCheck className="w-4 h-4 text-primary" title="Verified Seller" />}
                              <ExternalLink className="w-3 h-3 text-on-surface-variant ml-1" />
                            </a>
                          ) : (
                            <p className="font-semibold text-on-surface flex items-center gap-1.5">
                              {listing.seller?.name || 'Unknown Seller'}
                              {listing.seller?.isVerified && <ShieldCheck className="w-4 h-4 text-primary" title="Verified Seller" />}
                            </p>
                          )}
                          {listing.variation && <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mt-0.5">{listing.variation}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm font-semibold text-tertiary">
                        ★ {listing.seller?.trustScore.toFixed(1) || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      {listing.isInstantDelivery ? (
                         <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                           <Zap className="w-4 h-4" /> Instant
                         </div>
                      ) : (
                         <div className="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant">
                           <Clock className="w-4 h-4" /> Manual delivery
                         </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {listing.paymentMethods?.map(pm => (
                            <span key={pm} className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-surface-container-highest text-on-surface border border-outline-variant/30">{pm}</span>
                          ))}
                        </div>
                        {((listing as any).couponCode || (listing as any).discount) && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {(listing as any).couponCode && (
                              <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded border border-dashed border-tertiary/50 text-tertiary bg-tertiary/5" title="Use Coupon Code">
                                CODE: {(listing as any).couponCode}
                              </span>
                            )}
                            {(listing as any).discount && (
                              <span className="text-[10px] font-bold tracking-wide uppercase text-error" title="Discount applies">
                                -{(listing as any).discount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-heading font-bold text-xl text-primary flex items-center gap-2">
                          NPR {(listing.price).toLocaleString()}
                        </span>
                        {listing.originalPrice && (
                           <span className="text-xs text-on-surface-variant line-through">NPR {(listing.originalPrice).toLocaleString()}</span>
                        )}
                        {idx === 0 && <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider mt-1 border border-tertiary/30 px-1.5 py-0.5 rounded bg-tertiary/10">Best Price</span>}
                      </div>
                    </td>
                     <td className="p-4 pr-6 text-right">
                       <button 
                         onClick={async () => {
                           if (product?.id) {
                             try {
                               await updateDoc(doc(db, 'products', product.id), { clickCount: increment(1) });
                             } catch(ignore) {}
                           }
                           const targetUrl = (listing as any).exactLink || listing.seller?.storeUrl;
                           if (targetUrl) {
                             window.open(targetUrl, '_blank');
                           } else {
                             alert("Seller has not provided a link.");
                           }
                         }}
                         className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 float-right shadow-sm ${idx === 0 ? 'bg-primary text-on-primary hover:bg-primary-container shadow-primary/20' : 'bg-surface-container-low border border-outline-variant text-on-surface hover:bg-surface-container-high'}`}
                       >
                         Store Link <ExternalLink className="w-4 h-4 opacity-80" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Below Comparison details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
          <h3 className="font-heading font-bold text-lg mb-6">Price History</h3>
          <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-outline-variant)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 200', 'dataMax + 200']} stroke="var(--color-outline-variant)" fontSize={11} tickFormatter={(val) => `Rs.${val}`} width={60} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', border: '1px solid var(--color-outline-variant)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                  labelStyle={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}
                  formatter={(value: number) => [`NPR ${value}`, 'Price']}
                />
                <Line type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: "var(--color-surface)", stroke: "var(--color-primary)", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "var(--color-primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
          <h3 className="font-heading font-bold text-lg mb-6">Regional Compatibility</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
               <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
               <div>
                 <p className="font-semibold text-on-surface">Global Activation</p>
                 <p className="text-sm text-on-surface-variant">Can be activated in Nepal without issues.</p>
               </div>
            </li>
            <li className="flex items-start gap-3">
               <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
               <div>
                 <p className="font-semibold text-on-surface">No VPN Required</p>
                 <p className="text-sm text-on-surface-variant">Standard redeem process.</p>
               </div>
            </li>
          </ul>
        </section>
      </div>

    </div>
  );
}

function PackageIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
