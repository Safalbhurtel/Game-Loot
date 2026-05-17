import { useEffect, useState } from 'react';
import { collection, query, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BarChart3, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    sellers: 0,
    listings: 0,
    views: 0,
    clicks: 0,
  });

  const [topProducts, setTopProducts] = useState<{title: string, views: number, clicks: number, conversion: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [sSnap, lSnap, pSnap] = await Promise.all([
          getCountFromServer(collection(db, 'sellers')),
          getCountFromServer(collection(db, 'listings')),
          getDocs(query(collection(db, 'products')))
        ]);

        let sumViews = 0;
        let sumClicks = 0;
        const pArray: { title: string, views: number, clicks: number, conversion: number }[] = [];

        pSnap.docs.forEach(doc => {
           const d = doc.data();
           const vc = d.viewCount || 0;
           const cc = d.clickCount || 0;
           sumViews += vc;
           sumClicks += cc;
           pArray.push({
             title: d.title,
             views: vc,
             clicks: cc,
             conversion: vc > 0 ? (cc / vc) * 100 : 0
           });
        });

        // Top 5 viewed products
        pArray.sort((a, b) => b.views - a.views);

        setStats({
          products: pSnap.size,
          sellers: sSnap.data().count,
          listings: lSnap.data().count,
          views: sumViews,
          clicks: sumClicks
        });
        
        setTopProducts(pArray.slice(0, 5));
        
      } catch (e) {
        console.error("Error loading stats", e);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const analyticsData = [
    { name: 'Mon', views: 4000, clicks: 2400 },
    { name: 'Tue', views: 3000, clicks: 1398 },
    { name: 'Wed', views: 2000, clicks: 9800 },
    { name: 'Thu', views: 2780, clicks: 3908 },
    { name: 'Fri', views: 1890, clicks: 4800 },
    { name: 'Sat', views: 2390, clicks: 3800 },
    { name: 'Sun', views: 3490, clicks: 4300 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-bold text-on-surface">Overview</h2>
        <p className="text-on-surface-variant text-sm mt-1">Platform performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Views" value={stats.views} icon={BarChart3} />
        <StatCard title="Total Clicks (Outbound)" value={stats.clicks} icon={BarChart3} />
        <StatCard title="Overall Conv. Rate" value={stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) + '%' : '0%'} icon={TrendingUp} />
        <StatCard title="Total Products" value={stats.products} icon={ShoppingBag} />
        <StatCard title="Active Sellers" value={stats.sellers} icon={Users} />
        <StatCard title="Total Listings" value={stats.listings} icon={ShoppingBag} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        <div>
          <h3 className="font-heading font-bold text-lg mb-4">Traffic Overview (Sampled)</h3>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.2} />
                <XAxis dataKey="name" stroke="var(--color-outline-variant)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-outline-variant)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', border: '1px solid var(--color-outline-variant)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--color-on-surface)' }}
                />
                <Area type="monotone" dataKey="views" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="font-heading font-bold text-lg mb-4">Top Viewed Products</h3>
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 px-4 text-right">Views</th>
                  <th className="pb-3 px-4 text-right">Clicks</th>
                  <th className="pb-3 pl-4 text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-on-surface truncate max-w-[150px]">{p.title}</td>
                    <td className="py-3 px-4 text-right text-on-surface-variant">{p.views}</td>
                    <td className="py-3 px-4 text-right text-primary font-bold">{p.clicks}</td>
                    <td className="py-3 pl-4 text-right text-tertiary">
                      {p.conversion.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && !loading && (
                   <tr>
                     <td colSpan={4} className="py-6 text-center text-on-surface-variant">No product data available yet.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, isCurrency }: any) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs font-bold text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-on-surface-variant mb-1">{title}</p>
        <p className="text-2xl font-heading font-bold text-on-surface">
          {isCurrency ? `Rs. ${value.toLocaleString()}` : value}
        </p>
      </div>
    </div>
  );
}
