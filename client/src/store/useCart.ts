import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, size: number, swatchHex: string) => void;
  updateQuantity: (productId: string, size: number, swatchHex: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              item.size === newItem.size &&
              item.swatchHex === newItem.swatchHex
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += 1;
            return { items: updatedItems, isOpen: true };
          }

          return { items: [...state.items, { ...newItem, quantity: 1 }], isOpen: true };
        });
      },
      removeItem: (productId, size, swatchHex) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.productId === productId && item.size === size && item.swatchHex === swatchHex)
          ),
        }));
      },
      updateQuantity: (productId, size, swatchHex, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId && item.size === size && item.swatchHex === swatchHex
                ? { ...item, quantity: Math.max(1, quantity) }
                : item
            ),
        }));
      },
      clearCart: () => set({ items: [] }),
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
