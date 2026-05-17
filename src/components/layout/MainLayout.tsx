import { Outlet, Link } from 'react-router-dom';
import { Search, Compass, LogIn, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { auth } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

export function MainLayout() {
  const { user, profile } = useAuthStore();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary/30 selection:text-primary">
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-surface-container-high/50">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                GameLoot<span className="text-primary">Nepal</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-on-surface-variant">
              <Link to="/deals" className="hover:text-primary transition-colors">Deals</Link>
              <Link to="/categories" className="hover:text-primary transition-colors">Categories</Link>
              <Link to="/verification" className="hover:text-primary transition-colors">Verification</Link>
              <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 relative">
              <Search className="w-4 h-4 absolute left-3 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = `/search?q=${encodeURIComponent(e.currentTarget.value)}`;
                  }
                }}
                className="bg-surface-container-low text-sm rounded-full pl-9 pr-4 py-2 border border-outline-variant/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 w-[260px] transition-all"
              />
            </div>
            
            {user ? (
              <div className="flex items-center gap-4">
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-semibold text-primary hover:text-primary-container transition-colors">
                    Admin Panel
                  </Link>
                )}
                {profile?.role === 'seller' && (
                  <Link to="/seller" className="text-sm font-semibold text-secondary hover:text-secondary-on-container transition-colors">
                    Seller Portal
                  </Link>
                )}
                <Link to="/profile" className="text-sm font-semibold text-on-surface hover:text-white transition-colors flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold">
                     {profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                   </div>
                   Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-error hover:text-error-container transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>

      <footer className="w-full border-t border-surface-container mt-20 py-12 bg-surface-dim">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="font-heading font-bold text-xl tracking-tight text-white">
              GameLoot<span className="text-primary">Nepal</span>
            </Link>
            <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
              The premier destination for safe, instant, and affordable digital assets in Nepal. Compare with confidence.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/about" className="hover:text-primary">API for Sellers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link to="/legal" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link to="/legal" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/support" className="hover:text-primary">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Trust & Security</h4>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container-low text-xs font-medium text-on-surface">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              SSL Secured
            </div>
            <p className="mt-4 text-xs text-on-surface-variant">© {new Date().getFullYear()} GameLoot Nepal.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
