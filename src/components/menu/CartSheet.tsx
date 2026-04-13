"use client";

import { useState } from "react";
import { X, Plus, Minus, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency, getMultiLangValue } from "@/lib/utils";

interface Props {
  open: boolean;
  lang: "tr" | "en";
  currency: string;
  primaryColor: string;
  taxRate: number;
  tableId: string;
  tenantSlug: string;
  onClose: () => void;
}

export function CartSheet({ open, lang, currency, primaryColor, taxRate, tableId, tenantSlug, onClose }: Props) {
  const { items, updateQuantity, removeItem, clearCart, sessionToken, getTotalPrice } = useCartStore();
  const [orderNote, setOrderNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const subtotal = getTotalPrice();
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  if (!open) return null;

  async function handleOrder() {
    if (items.length === 0 || !sessionToken) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/orders/${tenantSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          sessionToken,
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.price + (item.selectedVariant?.option.price ?? 0),
            variantId: item.selectedVariant?.variantId,
            selectedVariant: item.selectedVariant,
            selectedExtras: item.selectedExtras,
            notes: item.notes,
          })),
          notes: orderNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.data.order.id);
        setOrderSuccess(true);
        clearCart();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
        <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {lang === "tr" ? "Siparişiniz Alındı!" : "Order Received!"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {lang === "tr" ? "Siparişiniz mutfağa iletildi. Az sonra hazırlanmaya başlanacak." : "Your order has been sent to the kitchen."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              {lang === "tr" ? "Menüye Dön" : "Back to Menu"}
            </Button>
            <a
              href={`/siparis/${orderId}`}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white text-sm font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              {lang === "tr" ? "Siparişi Takip Et" : "Track Order"}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Başlık */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <h2 className="font-bold text-lg">{lang === "tr" ? "Sepetim" : "My Cart"} ({items.length})</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Ürünler */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{lang === "tr" ? "Sepetiniz boş" : "Your cart is empty"}</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{getMultiLangValue(item.name, lang)}</p>
                  {item.selectedVariant && (
                    <p className="text-xs text-muted-foreground">{getMultiLangValue(item.selectedVariant.variantName, lang)}: {getMultiLangValue(item.selectedVariant.option, lang)}</p>
                  )}
                  {item.selectedExtras && item.selectedExtras.length > 0 && (
                    <p className="text-xs text-muted-foreground">{item.selectedExtras.map((e) => getMultiLangValue(e.name, lang)).join(", ")}</p>
                  )}
                  {item.notes && <p className="text-xs text-orange-600 italic">"{item.notes}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1, item.selectedVariant?.variantId)} className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">
                    {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3" />}
                  </button>
                  <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1, item.selectedVariant?.variantId)} className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm font-semibold w-16 text-right">
                  {formatCurrency((item.price + (item.selectedVariant?.option.price ?? 0) + (item.selectedExtras?.reduce((s, e) => s + e.price, 0) ?? 0)) * item.quantity, currency)}
                </p>
              </div>
            ))
          )}

          {items.length > 0 && (
            <div className="mt-3">
              <textarea
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400"
                rows={2}
                placeholder={lang === "tr" ? "Genel sipariş notu (opsiyonel)..." : "Order note (optional)..."}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Toplam ve sipariş ver */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{lang === "tr" ? "Ara toplam" : "Subtotal"}</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>KDV (%{taxRate})</span>
                <span>{formatCurrency(taxAmount, currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                <span>{lang === "tr" ? "Toplam" : "Total"}</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>
            <button
              onClick={handleOrder}
              disabled={submitting}
              className="w-full py-4 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {lang === "tr" ? "Sipariş Ver" : "Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
