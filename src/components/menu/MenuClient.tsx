"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, ShoppingCart, X, Plus, Minus, Wifi, Instagram, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency, getMultiLangValue, generateSessionToken } from "@/lib/utils";
import { ProductModal } from "@/components/menu/ProductModal";
import { CartSheet } from "@/components/menu/CartSheet";
import type { MenuCategoryWithItems, MenuItemWithDetails } from "@/types";

interface Props {
  tenant: { id: string; name: string; logoUrl: string | null; coverUrl: string | null; primaryColor: string; currency: string; taxRate: number; wifiName: string | null; wifiPassword: string | null; instagramUrl: string | null };
  table: { id: string; number: number; name: string | null };
  tenantSlug: string;
  categories: MenuCategoryWithItems[];
}

export function MenuClient({ tenant, table, tenantSlug, categories }: Props) {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [selectedItem, setSelectedItem] = useState<MenuItemWithDetails | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { items: cartItems, setSession, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    const savedLang = localStorage.getItem("qrmenu-lang") as "tr" | "en" | null;
    if (savedLang) setLang(savedLang);

    let sessionToken = localStorage.getItem(`session-${table.id}`);
    if (!sessionToken) {
      sessionToken = generateSessionToken();
      localStorage.setItem(`session-${table.id}`, sessionToken);
    }
    setSession(tenantSlug, table.number.toString(), sessionToken);
  }, [table.id, table.number, tenantSlug, setSession]);

  function changeLang(l: "tr" | "en") {
    setLang(l);
    localStorage.setItem("qrmenu-lang", l);
  }

  function scrollToCategory(catId: string) {
    setActiveCategory(catId);
    categoryRefs.current[catId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const getText = (value: unknown) => getMultiLangValue(value, lang);

  const filtered = categories.map((cat) => ({
    ...cat,
    menuItems: cat.menuItems.filter((item) => {
      if (!search) return true;
      const name = getText(item.name).toLowerCase();
      const desc = getText(item.description).toLowerCase();
      return name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
    }),
  })).filter((cat) => cat.menuItems.length > 0);

  const TAG_LABELS: Record<string, string> = {
    VEGAN: "🌱 Vegan", VEGETARIAN: "🥗 Vejeteryan", GLUTEN_FREE: "🚫G Glutensiz",
    NEW: "✨ Yeni", RECOMMENDED: "⭐ Önerilenler", SPICY: "🌶️ Acı",
  };

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen relative pb-24">
      {/* Kapak ve logo */}
      <div className="relative">
        {tenant.coverUrl ? (
          <Image src={tenant.coverUrl} alt={tenant.name} width={500} height={200} className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-36" style={{ backgroundColor: tenant.primaryColor + "20" }} />
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white" />
      </div>

      {/* Header */}
      <div className="px-4 pt-2 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logoUrl && (
              <Image src={tenant.logoUrl} alt={tenant.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow" />
            )}
            <div>
              <h1 className="font-bold text-gray-900">{tenant.name}</h1>
              <p className="text-xs text-muted-foreground">Masa {table.number}{table.name ? ` • ${table.name}` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => changeLang(lang === "tr" ? "en" : "tr")} className="text-xs px-2 py-1 border border-gray-200 rounded-full text-muted-foreground hover:border-primary hover:text-primary">
              {lang === "tr" ? "EN" : "TR"}
            </button>
          </div>
        </div>

        {/* Arama */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
            placeholder={lang === "tr" ? "Ürün ara..." : "Search..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Kategori sekmeleri */}
      {!search && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={activeCategory === cat.id ? { backgroundColor: tenant.primaryColor } : {}}
              >
                {getText(cat.name)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ürün listesi */}
      <div className="px-4 py-3 space-y-8">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{lang === "tr" ? "Ürün bulunamadı" : "No items found"}</p>
          </div>
        )}
        {filtered.map((cat) => (
          <div key={cat.id} ref={(el) => { categoryRefs.current[cat.id] = el; }}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{getText(cat.name)}</h2>
            <div className="space-y-3">
              {cat.menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item as unknown as MenuItemWithDetails)}
                  className="w-full flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:border-orange-200 hover:shadow-sm transition-all text-left"
                >
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={getText(item.name)} width={80} height={80} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300 text-2xl">🍽️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900">{getText(item.name)}</p>
                      <p className="font-bold text-orange-600 whitespace-nowrap text-sm">
                        {formatCurrency(item.price, tenant.currency)}
                      </p>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{getText(item.description)}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.tags.slice(0, 3).map((tag) => TAG_LABELS[tag] && (
                        <span key={tag} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{TAG_LABELS[tag]}</span>
                      ))}
                      {item.calories && <span className="text-xs text-muted-foreground">{item.calories} kcal</span>}
                      {item.preparationTime && <span className="text-xs text-muted-foreground">~{item.preparationTime}dk</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Wi-Fi ve sosyal bilgileri */}
        {(tenant.wifiName || tenant.instagramUrl) && (
          <div className="border border-gray-100 rounded-xl p-4 space-y-2">
            {tenant.wifiName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wifi className="w-4 h-4" />
                <span className="font-medium">Wi-Fi:</span>
                <span>{tenant.wifiName}</span>
                {tenant.wifiPassword && <span className="text-muted-foreground">/ {tenant.wifiPassword}</span>}
              </div>
            )}
            {tenant.instagramUrl && (
              <a href={tenant.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-pink-600 hover:underline">
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            )}
          </div>
        )}
      </div>

      {/* Sepet butonu */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 inset-x-4 z-20 max-w-lg mx-auto">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-white shadow-lg"
            style={{ backgroundColor: tenant.primaryColor }}
          >
            <div className="flex items-center gap-3">
              <span className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">{totalItems}</span>
              <span className="font-semibold">{lang === "tr" ? "Sepeti Görüntüle" : "View Cart"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold">
                {formatCurrency(cartItems.reduce((s, item) => {
                  const ext = item.selectedExtras?.reduce((a, e) => a + e.price, 0) ?? 0;
                  const vnt = item.selectedVariant?.option.price ?? 0;
                  return s + (item.price + ext + vnt) * item.quantity;
                }, 0), tenant.currency)}
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Ürün detay modal */}
      {selectedItem && (
        <ProductModal
          item={selectedItem}
          lang={lang}
          currency={tenant.currency}
          primaryColor={tenant.primaryColor}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Sepet sheet */}
      <CartSheet
        open={cartOpen}
        lang={lang}
        currency={tenant.currency}
        primaryColor={tenant.primaryColor}
        taxRate={tenant.taxRate}
        tableId={table.id}
        tenantSlug={tenantSlug}
        onClose={() => setCartOpen(false)}
      />
    </div>
  );
}
