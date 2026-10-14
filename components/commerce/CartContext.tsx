'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  buildOrderItems,
  calculateTotals,
  findProduct,
  type CartLine,
  type OrderItem,
  type Product,
  type Totals,
} from '@/lib/commerce';

/* -------------------------------------------------------------------------
   Cart state.

   Lines hold an id and a quantity only. Every price and total is derived from
   the catalogue at read time, so a stale or tampered price can never enter the
   cart, and the server recomputes them again on submission regardless.
------------------------------------------------------------------------- */

type View = 'closed' | 'buy' | 'cart' | 'checkout' | 'confirmed';

type CartContextValue = {
  lines: CartLine[];
  items: OrderItem[];
  totals: Totals;
  count: number;
  add: (id: string, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  view: View;
  openBuy: (product: Product) => void;
  openCart: () => void;
  openCheckout: () => void;
  close: () => void;
  buyProduct: Product | null;
  confirmation: { reference: string; items: OrderItem[]; totals: Totals } | null;
  confirm: (reference: string) => void;
  /** Announced politely for screen readers when the cart changes. */
  announcement: string;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [view, setView] = useState<View>('closed');
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [confirmation, setConfirmation] =
    useState<{ reference: string; items: OrderItem[]; totals: Totals } | null>(null);

  const add = useCallback((id: string, quantity = 1) => {
    const product = findProduct(id);
    if (!product || !product.available) return;
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id);
      const next = existing
        ? prev.map((l) => (l.id === id ? { ...l, quantity: Math.min(50, l.quantity + quantity) } : l))
        : [...prev, { id, quantity: Math.min(50, quantity) }];
      const total = next.find((l) => l.id === id)?.quantity ?? quantity;
      setAnnouncement(`${product.title} added to cart. Quantity ${total}.`);
      return next;
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    const product = findProduct(id);
    setLines((prev) => {
      if (quantity <= 0) {
        setAnnouncement(`${product?.title ?? 'Item'} removed from cart.`);
        return prev.filter((l) => l.id !== id);
      }
      const clamped = Math.min(50, quantity);
      setAnnouncement(`${product?.title ?? 'Item'} quantity ${clamped}.`);
      return prev.map((l) => (l.id === id ? { ...l, quantity: clamped } : l));
    });
  }, []);

  const remove = useCallback((id: string) => {
    const product = findProduct(id);
    setAnnouncement(`${product?.title ?? 'Item'} removed from cart.`);
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setAnnouncement('Cart emptied.');
  }, []);

  const openBuy = useCallback((product: Product) => {
    setBuyProduct(product);
    setView('buy');
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const items = buildOrderItems(lines);
    const totals = calculateTotals(lines);
    return {
      lines,
      items,
      totals,
      count: totals.itemCount,
      add,
      setQuantity,
      remove,
      clear,
      view,
      openBuy,
      openCart: () => setView('cart'),
      openCheckout: () => setView('checkout'),
      close: () => setView('closed'),
      buyProduct,
      confirmation,
      confirm: (reference: string) => {
        setConfirmation({ reference, items: buildOrderItems(lines), totals: calculateTotals(lines) });
        setLines([]);
        setView('confirmed');
        setAnnouncement('Order request received.');
      },
      announcement,
    };
  }, [lines, view, buyProduct, confirmation, announcement, add, setQuantity, remove, clear, openBuy]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
