import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Listing } from '../lib/types';

export function HomePage() {
  const [trending, setTrending] = useState<{product: Product, bestListing?: Listing}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // In a real app we'd fetch actual items. For right now let's just make it look good empty or add mock behavior.
      // We'll query trending products for now:
      try {
        const q = query(collection(db, 'products'), where('isTrending', '==', true), limit(3));
        const snap = await getDocs(q);
        const prods: {product: Product, bestListing?: Listing}[] = [];
        
        for (const pd of snap.docs) {
          const product = { id: pd.id, ...pd.data() } as Product;
          // Find lowest price listing
          const lq = query(collection(db, 'listings'), where('productId', '==', pd.id), where('status', '==', 'active'), orderBy('price', 'asc'), limit(1));
          const lSnap = await getDocs(lq);
          let bestListing: Listing | undefined;
          if (!lSnap.empty) {
             bestListing = { id: lSnap.docs[0].id, ...lSnap.docs[0].data() } as Listing;
          }
          prods.push({ product, bestListing });
        }
        setTrending(prods);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative text-center pt-24 pb-16 overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-surface-container-high/50 to-surface border border-outline-variant/10">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-luminosity pointer-events-none" />
         <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] bg-primary/10 blur-[120px] pointer-events-none" />
         <div className="absolute -bottom-[50%] -right-[10%] w-[60%] h-[100%] bg-tertiary/10 blur-[120px] pointer-events-none" />
         
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-balance mx-auto mb-8 relative z-10 drop-shadow-sm"
        >
          Premium Digital Loot, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary-container drop-shadow-md">
            Instantly Delivered.
          </span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-on-surface-variant text-xl max-w-2xl mx-auto mb-10 relative z-10 leading-relaxed font-medium"
        >
          The most trusted comparison platform in Nepal for game top-ups, subscriptions, and software licenses. Compare prices, payment methods, and buy with confidence.
        </motion.p>
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="relative z-10 flex flex-wrap justify-center gap-4"
        >
          <Link to="/deals" className="bg-primary text-on-primary hover:bg-primary-container px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
            Explore Deals <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/categories" className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2">
            Browse Categories
          </Link>
        </motion.div>
      </section>

      {/* Trending Deals */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">Trending Deals</h2>
            <p className="text-on-surface-variant text-sm">High-demand digital assets dropping in price.</p>
          </div>
          <Link to="/" className="text-primary text-sm font-semibold flex items-center hover:text-primary-container transition-colors">
            View all deals <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-80 bg-surface-container rounded-2xl animate-pulse" />)
          ) : trending.length > 0 ? (
            trending.map(({product, bestListing}) => (
              <ProductCard key={product.id} product={product} bestListing={bestListing} />
            ))
          ) : (
            // Empty state placeholder
            <div className="col-span-1 md:col-span-3 text-center py-12 bg-surface-container rounded-2xl border border-outline-variant/30">
              <p className="text-on-surface-variant">No trending deals available at the moment. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section>
         <h2 className="text-2xl font-heading font-bold mb-8">Browse by Category</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/" className="group h-48 bg-gradient-to-br from-surface-container-high to-surface-container relative rounded-2xl overflow-hidden border border-outline-variant/20 hover:border-primary/50 transition-all p-6 flex flex-col justify-end">
              <div className="absolute top-6 left-6 w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-1">Game Top-ups</h3>
              <p className="text-sm text-on-surface-variant">PUBG UC, Free Fire Diamonds, Valorant Points & more.</p>
            </Link>
            
            <div className="space-y-6">
              <Link to="/" className="group h-[calc(50%-12px)] bg-surface-container rounded-2xl border border-outline-variant/20 hover:border-primary/50 transition-all p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-heading mb-1">Streaming</h3>
                  <p className="text-xs text-on-surface-variant">Netflix, Spotify, Prime</p>
                </div>
                <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
              </Link>
              <Link to="/" className="group h-[calc(50%-12px)] bg-surface-container rounded-2xl border border-outline-variant/20 hover:border-primary/50 transition-all p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-heading mb-1">Gift Cards</h3>
                  <p className="text-xs text-on-surface-variant">Steam, PSN, Apple</p>
                </div>
                <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
              </Link>
            </div>

            <Link to="/" className="group h-48 bg-gradient-to-br from-surface-container-high to-surface-container relative rounded-2xl overflow-hidden border border-outline-variant/20 hover:border-primary/50 transition-all p-6 flex flex-col justify-end">
              <div className="absolute top-6 left-6 w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-1">Software & Tools</h3>
              <p className="text-sm text-on-surface-variant">Antivirus, VPNs, Windows licenses.</p>
            </Link>
         </div>
      </section>

      {/* Why Trust Us? */}
      <section className="py-12">
        <h2 className="text-3xl font-heading font-bold text-center mb-12">Why Trust Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-heading mb-3">Verified Sellers Only</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Every seller on our platform undergoes a strict vetting process. We check their history, customer reviews, and business legitimacy before they can list products.
            </p>
          </div>
          <div className="text-center">
             <div className="w-16 h-16 mx-auto bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-heading mb-3">Secure Transactions</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Even though payments are made through third-party platforms like eSewa or Khalti, we track all listed transactions and assist in dispute resolutions if needed.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
               </svg>
            </div>
            <h3 className="text-xl font-bold font-heading mb-3">Price Transparency</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              No hidden fees or surprise charges. What you see is what you pay. Compare base prices and instant delivery convenience from top sellers.
            </p>
          </div>
        </div>
      </section>

      {/* Payment methods section tailored for Nepal */}
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <h2 className="text-2xl font-heading font-bold mb-4">Seamless Payments in Nepal</h2>
          <p className="text-on-surface-variant">We index sellers that support local wallets and bank transfers for zero-friction digital checkouts. No international cards required.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="px-4 py-2 bg-[#60BB46]/10 text-[#60BB46] border border-[#60BB46]/30 rounded-lg font-bold text-sm tracking-wide">eSewa</div>
          <div className="px-4 py-2 bg-[#5E3286]/10 text-[#5E3286] border border-[#5E3286]/30 rounded-lg font-bold text-sm tracking-wide">Khalti</div>
          <div className="px-4 py-2 bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-lg font-bold text-sm tracking-wide">Bank Transfer</div>
        </div>
      </section>

    </div>
  );
}

function ProductCard({ product, bestListing, ...props }: { product: Product, bestListing?: Listing, [key: string]: any }) {
  return (
    <Link to={`/product/${product.id}`} className="group relative block w-full h-[400px] bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/20 hover:border-primary/40 transition-all flex flex-col">
      <div className="h-56 bg-surface-container-high relative overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container flex items-center justify-center text-outline">
            No Image
          </div>
        )}
        {product.isTrending && (
          <div className="absolute top-4 right-4 bg-tertiary text-on-tertiary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Zap className="w-3 h-3" fill="currentColor" /> Best Price
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {bestListing?.isInstantDelivery && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary mb-2 uppercase tracking-wide">
              <Zap className="w-3 h-3" /> Instant Delivery
            </div>
          )}
          <h3 className="font-heading font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {product.title}
          </h3>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 relative">
          <div>
            <p className="text-xs text-on-surface-variant mb-0.5">Starting from</p>
            <div className="flex items-end gap-2">
              <p className="font-heading font-bold text-xl text-primary">
                {bestListing ? `Rs. ${bestListing.price.toLocaleString()}` : "Out of Stock"}
              </p>
              {bestListing?.originalPrice && bestListing.originalPrice > bestListing.price && (
                <p className="text-sm text-on-surface-variant line-through mb-0.5">
                  Rs. {bestListing.originalPrice.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center group-hover:bg-primary group-hover:text-surface transition-colors">
            <ShoppingCart className="w-4 h-4 ml-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
