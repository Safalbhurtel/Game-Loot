import { Link } from 'react-router-dom';
import { Gamepad2, Gift, Tv, Shield, Globe, CreditCard } from 'lucide-react';

export function CategoriesPage() {
  const categories = [
    { name: 'Game Top-ups', icon: Gamepad2, count: 24, desc: 'PUBG, FreeFire, Valorant, Mobile Legends', color: 'text-primary' },
    { name: 'Gift Cards', icon: Gift, count: 18, desc: 'Steam, Google Play, Apple, PlayStation', color: 'text-tertiary' },
    { name: 'Streaming', icon: Tv, count: 12, desc: 'Netflix, Spotify, Prime Video, Disney+', color: 'text-secondary' },
    { name: 'Software', icon: Shield, count: 9, desc: 'Antivirus, Windows, Office 365', color: 'text-primary' },
    { name: 'VPN Services', icon: Globe, count: 5, desc: 'NordVPN, ExpressVPN, Surfshark', color: 'text-tertiary' },
    { name: 'Prepaid Cards', icon: CreditCard, count: 3, desc: 'Virtual Mastercards, Visa Prepaid', color: 'text-secondary' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center py-12">
        <h1 className="text-4xl font-heading font-bold mb-4 text-on-surface">Browse Categories</h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto">
          Explore our wide range of digital products available through verified sellers in Nepal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, i) => (
          <Link key={i} to="/search" className="group bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 transition-all rounded-2xl p-6 flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-surface-container-highest ${cat.color} group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold bg-surface-container-high px-2 py-1 rounded text-on-surface-variant group-hover:text-primary transition-colors">
                {cat.count} Items
              </span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl mb-1">{cat.name}</h3>
              <p className="text-sm text-on-surface-variant">{cat.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
