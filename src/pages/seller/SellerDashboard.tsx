import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Tag, TrendingUp, DollarSign } from 'lucide-react';
import { Seller } from '../../lib/types';

export function SellerDashboard() {
  const [stats, setStats] = useState({ listings: 0 });
  const [sellerId, setSellerId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!auth.currentUser) return;
      try {
        const sq = query(collection(db, 'sellers'), where('ownerId', '==', auth.currentUser.uid));
        const sSnap = await getDocs(sq);
        
        if (!sSnap.empty) {
          const sid = sSnap.docs[0].id;
          setSellerId(sid);
          
          const lq = query(collection(db, 'listings'), where('sellerId', '==', sid));
          const lSnap = await getCountFromServer(lq);
          
          setStats({
            listings: lSnap.data().count,
          });
        }
      } catch (e) {
        console.error("Error loading seller stats", e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-bold text-on-surface">Store Overview</h2>
        <p className="text-on-surface-variant text-sm mt-1">Manage your storefront</p>
      </div>
      
      {!sellerId ? (
        <div className="bg-error/10 border border-error/20 p-6 rounded-xl flex items-center gap-4">
          <p className="text-error font-medium">Your account is not linked to any Seller profile. Please contact an admin.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Active Listings" value={stats.listings} icon={Tag} />
            <StatCard title="Store Views" value="N/A" icon={TrendingUp} />
            <StatCard title="Sales (Estimate)" value="N/A" icon={DollarSign} isCurrency />
          </div>

          <div className="mt-8 bg-surface-container-low border border-outline-variant/20 rounded-xl p-8">
            <h3 className="font-heading font-bold text-lg mb-4">Welcome to your dashboard</h3>
            <p className="text-on-surface-variant text-sm max-w-2xl">Use the sidebar to navigate to "My Listings" where you can create new product offers, set pricing, adjust stock, and update your delivery methods.</p>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, isCurrency }: any) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
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
          {value}
        </p>
      </div>
    </div>
  );
}
