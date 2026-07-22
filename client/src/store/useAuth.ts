import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Address {
  _id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profilePhoto?: string;
  language?: string;
  notificationsEnabled?: boolean;
  preferredPaymentMethod?: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  addresses: Address[];
  wishlist: any[];
  isLoggedIn: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateProfileState: (updatedFields: Partial<UserProfile>) => void;
  setAddresses: (addresses: Address[]) => void;
  setWishlist: (wishlist: any[]) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      addresses: [],
      wishlist: [],
      isLoggedIn: false,
      setToken: (token) => set({ token, isLoggedIn: !!token }),
      setUser: (user) => set({ user }),
      login: (token, user) => set({ token, user, isLoggedIn: true }),
      logout: () => set({ token: null, user: null, addresses: [], wishlist: [], isLoggedIn: false }),
      updateProfileState: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
      setAddresses: (addresses) => set({ addresses }),
      setWishlist: (wishlist) => set({ wishlist }),
    }),
    {
      name: 'prem-dhaga-auth', // localstorage key
    }
  )
);
