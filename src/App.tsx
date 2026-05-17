import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './lib/store';
import { OperationType, handleFirestoreError } from './lib/errorHandling';

// Layouts & Pages
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { SellerLayout } from './components/layout/SellerLayout';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminSellers } from './pages/admin/AdminSellers';
import { AdminListings } from './pages/admin/AdminListings';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { SellerListings } from './pages/seller/SellerListings';

// Public Pages
import { DealsPage } from './pages/public/DealsPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { VerificationPage } from './pages/public/VerificationPage';
import { SearchPage } from './pages/public/SearchPage';
import { AboutPage } from './pages/public/AboutPage';
import { LegalPage } from './pages/public/LegalPage';
import { SupportPage } from './pages/public/SupportPage';
import { ProfilePage } from './pages/public/ProfilePage';

export default function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setProfile({ id: snap.id, ...snap.data() } as any);
          } else {
            const defaultRole = user.email === 'nepalecommart@gmail.com' ? 'admin' : 'user';
            const newUser = {
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              role: defaultRole,
              createdAt: serverTimestamp()
            };
            await setDoc(docRef, newUser);
            setProfile({ id: user.uid, ...newUser } as any);
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, 'users');
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [setUser, setProfile, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="listings" element={<AdminListings />} />
        </Route>

        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<SellerDashboard />} />
          <Route path="listings" element={<SellerListings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
