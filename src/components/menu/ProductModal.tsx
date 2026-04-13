"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency, getMultiLangValue } from "@/lib/utils";
import type { MenuItemWithDetails } from "@/types";

interface Props {
  item: MenuItemWithDetails;
  lang: "tr" | "en";
  currency: string;
  primaryColor: string;
  onClose: () => void;
}

export function ProductModal({ item, lang, currency, primaryColor, onClose }: Props) {
  const getText = (v: unknown) => getMultiLangValue(v, lang);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { option: { tr: string; en?: string; price: number }; variantName: Record<string, string> }>>({});
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  const extrasTotal = item.extras
    .filter((e) => selectedExtras[e.id])
    .reduce((s, e) => s + e.price, 0);

  const variantTotal = Object.values(selectedVariants).reduce((s, v) => s + (v.option.price ?? 0), 0);
  const unitPrice = item.price + variantTotal + extrasTotal;

  function handleAddToCart() {
    const firstVariant = Object.entries(selectedVariants)[0];
    addItem({
      menuItemId: item.id,
      name: item.name as Record<string, string>,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity,
      selectedVariant: firstVariant ? {
        variantId: firstVariant[0],
        variantName: firstVariant[1].variantName as Record<string, string>,
        option: firstVariant[1].option,
      } : undefined,
      selectedExtras: item.extras
        .filter((e) => selectedExtras[e.id])
        .map((e) => ({ extraId: e.id, name: e.name as Record<string, string>, price: e.price })),
      notes: notes || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Ürün resmi */}
        <div className="relative">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={getText(item.name)} width={500} height={300} className="w-full h-56 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-5xl">🍽️</div>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-white rounded-full p-2 shadow">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900">{getText(item.name)}</h2>
          {item.description && <p className="text-sm text-muted-foreground mt-1">{getText(item.description)}</p>}

          <div className="flex gap-2 mt-2 flex-wrap">
            {item.calories && <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{item.calories} kcal</span>}
            {item.preparationTime && <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">~{item.preparationTime} dk</span>}
            {item.allergens.length > 0 && (
              <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                ⚠️ {item.allergens.join(", ")}
              </span>
            )}
          </div>

          {/* Varyantlar */}
          {item.variants.map((variant) => {
            const options = variant.options as { tr: string; en?: string; price: number }[];
            const variantName = variant.name as Record<string, string>;
            return (
              <div key={variant.id} className="mt-4">
                <p className="font-semibold text-sm text-gray-800 mb-2">
                  {getText(variantName)}
                  {variant.isRequired && <span className="text-red-500 ml-1">*</span>}
                </p>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <label key={i} className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:border-orange-300">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`variant-${variant.id}`}
                          checked={selectedVariants[variant.id]?.option === opt}
                          onChange={() => setSelectedVariants({ ...selectedVariants, [variant.id]: { option: opt, variantName } })}
                          className="accent-orange-500"
                        />
                        <span className="text-sm">{getText(opt)}</span>
                      </div>
                      {opt.price > 0 && <span className="text-sm text-orange-600">+{formatCurrency(opt.price, currency)}</span>}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Ekstralar */}
          {item.extras.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-sm text-gray-800 mb-2">Ekstralar</p>
              <div className="space-y-2">
                {item.extras.map((extra) => (
                  <label key={extra.id} className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:border-orange-300">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedExtras[extra.id] ?? false}
                        onChange={(e) => setSelectedExtras({ ...selectedExtras, [extra.id]: e.target.checked })}
                        className="accent-orange-500"
                      />
                      <span className="text-sm">{getText(extra.name)}</span>
                    </div>
                    <span className="text-sm text-orange-600">+{formatCurrency(extra.price, currency)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Not */}
          <div className="mt-4">
            <p className="font-semibold text-sm text-gray-800 mb-2">{lang === "tr" ? "Özel Not" : "Special Note"}</p>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400"
              rows={2}
              placeholder={lang === "tr" ? "Özel isteğiniz var mı?" : "Any special request?"}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Adet ve ekle */}
          <div className="flex items-center gap-4 mt-5">
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              {lang === "tr" ? "Sepete Ekle" : "Add to Cart"} — {formatCurrency(unitPrice * quantity, currency)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
