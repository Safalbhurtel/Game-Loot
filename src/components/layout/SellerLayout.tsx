import { Outlet, Link, useLocation } from 'react-router-dom';
import { Store, Tag, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export function SellerLayout() {
  const { profile } = useAuthStore();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navItems = [
    { label: 'Dashboard', icon: Store, path: '/seller' },
    { label: 'My Listings', icon: Tag, path: '/seller/listings' },
  ];

  return (
    <div className="min-h-screen bg-surface flex text-on-surface font-sans">
      <aside className="w-64 border-r border-surface-container bg-surface-dim hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading font-bold text-xl tracking-tight text-white">
              GameLoot<span className="text-secondary">Seller</span>
            </span>
          </Link>
          <p className="text-xs font-medium text-outline mt-1 uppercase tracking-wider">Merchant Portal</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-secondary-container text-on-secondary-container' 
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-container space-y-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
            <LogOut className="w-5 h-5" />
            Exit Portal
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-surface-container bg-surface/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="font-heading font-bold text-lg">Seller Console</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
              {profile?.displayName?.charAt(0) || 'S'}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
