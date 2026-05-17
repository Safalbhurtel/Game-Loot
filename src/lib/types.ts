export type Role = 'user' | 'seller' | 'admin';

export interface UserProfile {
  id: string; // from auth
  email: string;
  role: Role;
  displayName?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
}

export interface Seller {
  id: string; // doc id
  ownerId: string;
  name: string;
  trustScore: number; // 0-5
  isVerified: boolean;
  logoUrl?: string;
  storeUrl?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface ProductVariation {
  name: string;
  imageUrl?: string;
}

export interface Product {
  id: string; // doc id
  title: string;
  category: string;
  description?: string;
  imageUrl?: string;
  isTrending?: boolean;
  variations?: (string | ProductVariation)[]; // support old string and new object
  seoTitle?: string;
  seoDescription?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface Listing {
  id: string; // doc id
  productId: string;
  sellerId: string;
  variation?: string; // e.g. "Deluxe Edition"
  price: number; // NPR
  originalPrice?: number;
  stock: number;
  status: 'active' | 'inactive';
  isInstantDelivery?: boolean;
  paymentMethods?: string[]; // eSewa, Khalti, Bank Transfer, Card
  region?: string;
  platform?: string; // Steam, App Store, Custom
  createdAt: any;
  updatedAt?: any;
}

export interface Favorite {
  id: string;
  listingId: string;
  productId: string;
  createdAt: any;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: any;
}
