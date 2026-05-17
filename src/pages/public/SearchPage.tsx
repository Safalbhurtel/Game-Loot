import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, Listing } from '../../lib/types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Info, Filter } from 'lucide-react';

export function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [instantDeliveryOnly, setInstantDeliveryOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const getQ = params.get('q');
    if (getQ) {
      setSearchTerm(getQ);
    }

    async function loadData() {
      try {
        const pQ = query(collection(db, 'products'), orderBy('title'));
        const pSnap = await getDocs(pQ);
        setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Product));

        const lQ = query(collection(db, 'listings'));
        const lSnap = await getDocs(lQ);
        setListings(lSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Listing));
      } catch (e) {
        console.error('Failed to fetch data', e);
      }
      setLoading(false);
    }
    loadData();
  }, [location.search]);

  // Derive unique categories and payment methods for filter UI
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const allPayments = Array.from(new Set(listings.flatMap(l => l.paymentMethods || []))).filter(Boolean);

  const toggleCategory = (c: string) => {
    setSelectedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const togglePayment = (p: string) => {
    setSelectedPayments(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleSearchKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    navigate(`/search?q=${encodeURIComponent(e.target.value)}`, { replace: true });
  }

  const filtered = products.filter(p => {
    // 1. Search term
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Category
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;

    // Evaluate listings for this product to check listing-level filters
    const productListings = listings.filter(l => l.productId === p.id && l.status === 'active' && l.stock > 0);

    // 3. Instant Delivery
    if (instantDeliveryOnly) {
      if (!productListings.some(l => l.isInstantDelivery)) return false;
    }

    // 4. Payment Methods
    if (selectedPayments.length > 0) {
      // Return true if ANY of the product's active listings has ANY of the selected payment methods
      const hasMatchingPayment = productListings.some(l => 
        l.paymentMethods?.some(pm => selectedPayments.includes(pm))
      );
      if (!hasMatchingPayment) return false;
    }

    return true;
  });

  return (
    <div className="min-h-[60vh] flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar (Desktop) / Dropdown (Mobile) */}
      <div className="w-full md:w-64 space-y-6">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="w-full md:hidden flex items-center justify-between bg-surface-container py-3 px-4 rounded-xl font-bold"
        >
          <span className="flex items-center gap-2"><Filter className="w-4 h-4"/> Filters</span>
          <span className="text-sm bg-primary/20 text-primary px-2 py-0.5 rounded-full">{selectedCategories.length + selectedPayments.length + (instantDeliveryOnly ? 1 : 0)} Active</span>
        </button>

        <div className={`space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase text-on-surface-variant mb-4">Availability</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={instantDeliveryOnly} onChange={e => setInstantDeliveryOnly(e.target.checked)} className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary bg-surface" />
              <span className="text-sm font-medium">Instant Delivery</span>
            </label>
          </div>

          {categories.length > 0 && (
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase text-on-surface-variant mb-4">Categories</h4>
              <div className="space-y-2">
                {categories.map(c => (
                  <label key={c} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selectedCategories.includes(c)} onChange={() => toggleCategory(c)} className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary bg-surface" />
                    <span className="text-sm font-medium">{c}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {allPayments.length > 0 && (
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase text-on-surface-variant mb-4">Payment Methods</h4>
              <div className="space-y-2">
                {allPayments.map(p => (
                  <label key={p} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selectedPayments.includes(p)} onChange={() => togglePayment(p)} className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary bg-surface" />
                    <span className="text-sm font-medium">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-8 relative shadow-2xl rounded-2xl">
          <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input 
            autoFocus
            type="text"
            value={searchTerm}
            onChange={handleSearchKeys}
            placeholder="Search games, gift cards, subscriptions..."
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl py-4 pl-14 pr-6 text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-on-surface-variant animate-pulse">Loading items...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.length > 0 ? (
              filtered.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 rounded-xl overflow-hidden transition-all group flex flex-col">
                  <div className="h-40 bg-surface-container-high relative">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline text-xs">No visual</div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-1">{p.category}</p>
                    <h3 className="font-heading font-semibold text-on-surface group-hover:text-primary transition-colors text-sm line-clamp-2 leading-tight">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-on-surface-variant">
                <Info className="w-12 h-12 mb-4 opacity-50" />
                <p>No products found matching your search and filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
