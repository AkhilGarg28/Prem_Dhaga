import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuth } from './useAuth';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: number;
  swatchHex: string;
  swatchName: string;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, size: number, swatchHex: string) => void;
  updateQuantity: (productId: string, size: number, swatchHex: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

let cartSyncTimer: ReturnType<typeof setTimeout> | null = null;

const serializeCart = (items: CartItem[]) =>
  items.map((item) => ({
    product: item.productId,
    size: item.size,
    swatchHex: item.swatchHex,
    swatchName: item.swatchName,
    quantity: item.quantity,
  }));

const syncCartWithServer = (items: CartItem[]) => {
  if (cartSyncTimer) {
    clearTimeout(cartSyncTimer);
  }

  const cartItems = serializeCart(items);

  cartSyncTimer = setTimeout(async () => {
    const token = useAuth.getState().token;
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/auth/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItems }),
      });
    } catch {
      // Cart updates stay instant and durable in local storage even if the API is unavailable.
    }
  }, 500);
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setItems: (items) => {
        set({ items });
        syncCartWithServer(items);
      },
      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              item.size === newItem.size &&
              item.swatchHex === newItem.swatchHex
          );

          let updatedItems = [];
          if (existingIndex > -1) {
            updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += 1;
          } else {
            updatedItems = [...state.items, { ...newItem, quantity: 1 }];
          }

          // Trigger async sync
          syncCartWithServer(updatedItems);

          return { items: updatedItems, isOpen: true };
        });
      },
      removeItem: (productId, size, swatchHex) => {
        set((state) => {
          const updatedItems = state.items.filter(
            (item) =>
              !(item.productId === productId && item.size === size && item.swatchHex === swatchHex)
          );

          // Trigger async sync
          syncCartWithServer(updatedItems);

          return { items: updatedItems };
        });
      },
      updateQuantity: (productId, size, swatchHex, quantity) => {
        set((state) => {
          const updatedItems = state.items
            .map((item) =>
              item.productId === productId && item.size === size && item.swatchHex === swatchHex
                ? { ...item, quantity }
                : item
            )
            .filter((item) => item.quantity > 0);

          // Trigger async sync
          syncCartWithServer(updatedItems);

          return { items: updatedItems };
        });
      },
      clearCart: () => {
        set({ items: [] });
        syncCartWithServer([]);
      },
      setIsOpen: (isOpen) => set({ isOpen }),
      getCartTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      getCartCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'prem-dhaga-cart', // localstorage key
    }
  )
);
