import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, Listing } from '../../lib/types';
import { Link } from 'react-router-dom';
import { ShoppingCart, Zap } from 'lucide-react';

export function DealsPage() {
  const [deals, setDeals] = useState<{product: Product, bestListing?: Listing}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      try {
        // In a real scenario, we'd query listings with high discounts.
        // For now, let's just grab some products and their active listings.
        const q = query(collection(db, 'products'));
        const pSnap = await getDocs(q);
        const prods: {product: Product, bestListing?: Listing}[] = [];
        for (const doc of pSnap.docs) {
          const product = { id: doc.id, ...doc.data() } as Product;
          const lq = query(collection(db, 'listings'));
          const lSnap = await getDocs(lq);
          const activeListings = lSnap.docs
            .map(l => ({ id: l.id, ...l.data() } as Listing))
            .filter(l => l.productId === product.id && l.status === 'active')
            .sort((a, b) => a.price - b.price);
          
          if (activeListings.length > 0) {
            prods.push({ product, bestListing: activeListings[0] });
          }
        }
        setDeals(prods);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchDeals();
  }, []);

  return (
    <div className="space-y-12">
      <div className="text-center py-12 bg-surface-container-low border border-outline-variant/20 rounded-[2rem]">
        <h1 className="text-4xl font-heading font-bold mb-4 text-on-surface">Deals & Offers</h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto">
          Discover the best digital product deals in Nepal. Prices are updated frequently by our verified sellers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-surface-container rounded-2xl animate-pulse" />)
        ) : deals.length > 0 ? (
          deals.map(({product, bestListing}) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group relative block w-full bg-surface-container hover:bg-surface-container-high rounded-2xl overflow-hidden border border-outline-variant/20 hover:border-primary/40 transition-all flex flex-col h-[360px]">
              <div className="h-48 bg-surface-container-high relative overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">No visual</div>
                )}
                {product.isTrending && (
                  <div className="absolute top-4 right-4 bg-tertiary text-on-tertiary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Zap className="w-3 h-3" fill="currentColor" /> Trending
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <h3 className="font-heading font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between mt-auto relative">
                  <div>
                    <div className="flex items-end gap-2">
                      <p className="font-heading font-bold text-xl text-primary">
                        {bestListing ? `Rs. ${bestListing.price.toLocaleString()}` : "N/A"}
                      </p>
                      {bestListing?.originalPrice && bestListing.originalPrice > bestListing.price && (
                        <p className="text-sm text-on-surface-variant line-through mb-0.5">
                          Rs. {bestListing.originalPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-on-surface-variant">
            No active deals found. Please check back later.
          </div>
        )}
      </div>
    </div>
  );
}
