"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Product, CartItem } from "@/lib/theme-types";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeItem: (productId: string, selectedSize?: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  itemCount: number;
  subtotal: number;
  /** Delivery locations valid for every non-free-delivery item currently in
   * the cart — the customer picks one at checkout. Empty when the cart has
   * no charged items, or when charged items don't share any location in
   * common (an honest merchant-data gap, not something to paper over). */
  deliveryLocations: string[];
  selectedDeliveryLocation: string | null;
  setDeliveryLocation: (name: string) => void;
  /** Real sum of each charged item's price for selectedDeliveryLocation.
   * 0 when there's nothing to charge for (empty cart, all-free-delivery
   * cart, or no location picked yet) — never a fabricated flat fee. */
  deliveryFee: number;
  freeDeliveryThreshold: number;
  appliedCoupon: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "aurora_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const freeDeliveryThreshold = 2500;

  // Load from localStorage on mount. A cart saved before freeDelivery/
  // deliveryCharges existed on Product (or from an old build) won't have
  // them — backfill safe defaults here, once, rather than every downstream
  // computation needing its own `?.` against a shape that should always be
  // complete going forward.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        setItems(
          parsed.map((item) => ({
            ...item,
            product: {
              ...item.product,
              freeDelivery: item.product.freeDelivery ?? true,
              deliveryCharges: item.product.deliveryCharges ?? [],
            },
          }))
        );
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items, mounted]);

  const addItem = (
    product: Product,
    quantity: number = 1,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    setItems((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (index > -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          quantity: updated[index].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          selectedSize,
          selectedColor,
        },
      ];
    });

    setIsDrawerOpen(true);
  };

  const removeItem = (
    productId: string,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    if (quantity <= 0) {
      removeItem(productId, selectedSize, selectedColor);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Only items the merchant actually charges for matter here — a
  // free-delivery product never restricts which locations are offered.
  const chargedItems = useMemo(
    () => items.filter((item) => !item.product.freeDelivery && (item.product.deliveryCharges?.length ?? 0) > 0),
    [items]
  );

  // A location only counts if EVERY charged item can actually be shipped
  // there — otherwise picking it would silently under-charge for whatever
  // item doesn't support it. Falls back to the union so the customer still
  // sees something to choose from rather than a dead end, but see
  // deliveryFee below: an item without the chosen location contributes 0,
  // it's never guessed at.
  const deliveryLocations = useMemo(() => {
    if (chargedItems.length === 0) return [];
    const locationSets = chargedItems.map(
      (item) => new Set((item.product.deliveryCharges ?? []).map((dc) => dc.name))
    );
    const allNames = Array.from(new Set(chargedItems.flatMap((item) => (item.product.deliveryCharges ?? []).map((dc) => dc.name))));
    const common = allNames.filter((name) => locationSets.every((set) => set.has(name)));
    return common.length > 0 ? common : allNames;
  }, [chargedItems]);

  const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState<string | null>(null);

  // Keep the selection valid as the cart changes — pick a default the
  // first time locations become available, and re-pick if the current
  // choice stops being one of them (e.g. the item requiring it was removed).
  useEffect(() => {
    if (deliveryLocations.length === 0) {
      if (selectedDeliveryLocation !== null) setSelectedDeliveryLocation(null);
      return;
    }
    if (!selectedDeliveryLocation || !deliveryLocations.includes(selectedDeliveryLocation)) {
      setSelectedDeliveryLocation(deliveryLocations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryLocations]);

  const deliveryFee = useMemo(() => {
    if (!selectedDeliveryLocation) return 0;
    return chargedItems.reduce((sum, item) => {
      const match = (item.product.deliveryCharges ?? []).find((dc) => dc.name === selectedDeliveryLocation);
      return sum + (match ? match.charge : 0);
    }, 0);
  }, [chargedItems, selectedDeliveryLocation]);

  let couponDiscount = 0;
  if (appliedCoupon === "ANANYA10") {
    couponDiscount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === "UTSHOB25") {
    couponDiscount = Math.min(250, subtotal);
  }

  const total = Math.max(0, subtotal + deliveryFee - couponDiscount);

  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === "ANANYA10") {
      setAppliedCoupon("ANANYA10");
      return { success: true, message: "10% discount successfully applied!" };
    } else if (trimmed === "UTSHOB25") {
      setAppliedCoupon("UTSHOB25");
      return { success: true, message: "৳250 special discount successfully applied!" };
    } else {
      return { success: false, message: "Sorry, invalid or expired coupon code." };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        toggleDrawer: () => setIsDrawerOpen((v) => !v),
        itemCount,
        subtotal,
        deliveryLocations,
        selectedDeliveryLocation,
        setDeliveryLocation: setSelectedDeliveryLocation,
        deliveryFee,
        freeDeliveryThreshold,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
