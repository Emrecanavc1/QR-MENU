"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Plus, Pencil, Trash2, GripVertical, Eye, EyeOff,
  ChevronDown, ChevronRight, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getMultiLangValue } from "@/lib/utils";
import { CategoryModal } from "@/components/admin/CategoryModal";
import { MenuItemModal } from "@/components/admin/MenuItemModal";
import type { MenuCategoryWithItems } from "@/types";

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [catModal, setCatModal] = useState<{ open: boolean; data?: MenuCategoryWithItems["menuItems"][0] | null }>({ open: false });
  const [itemModal, setItemModal] = useState<{ open: boolean; categoryId?: string; data?: MenuCategoryWithItems["menuItems"][0] | null }>({ open: false });

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/menu");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
        setExpandedCats(new Set(data.data.categories.map((c: MenuCategoryWithItems) => c.id)));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  async function toggleCategory(id: string, isActive: boolean) {
    await fetch(`/api/v1/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchMenu();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz? İçindeki ürünler de silinir.")) return;
    await fetch(`/api/v1/admin/categories/${id}`, { method: "DELETE" });
    fetchMenu();
  }

  async function toggleItem(id: string, isAvailable: boolean) {
    await fetch(`/api/v1/admin/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !isAvailable }),
    });
    fetchMenu();
  }

  async function deleteItem(id: string) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/v1/admin/items/${id}`, { method: "DELETE" });
    fetchMenu();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menü Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} kategori, {categories.reduce((s, c) => s + c.menuItems.length, 0)} ürün
          </p>
        </div>
        <Button onClick={() => setCatModal({ open: true })}>
          <Plus className="w-4 h-4" />
          Kategori Ekle
        </Button>
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <UtensilsCrossedIcon />
            <p className="mt-2">Henüz kategori eklenmemiş</p>
            <Button className="mt-4" onClick={() => setCatModal({ open: true })}>
              İlk Kategoriyi Ekle
            </Button>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Kategori başlığı */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <button
                  className="p-1"
                  onClick={() => setExpandedCats((prev) => {
                    const next = new Set(prev);
                    next.has(cat.id) ? next.delete(cat.id) : next.add(cat.id);
                    return next;
                  })}
                >
                  {expandedCats.has(cat.id)
                    ? <ChevronDown className="w-4 h-4 text-gray-500" />
                    : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>
                <span className="font-semibold text-gray-800 flex-1">
                  {getMultiLangValue(cat.name)}
                </span>
                <Badge variant={cat.isActive ? "success" : "secondary"}>
                  {cat.menuItems.length} ürün
                </Badge>
                {cat.availableFrom && (
                  <Badge variant="info">{cat.availableFrom} - {cat.availableTo}</Badge>
                )}
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setCatModal({ open: true, data: cat as unknown as MenuCategoryWithItems["menuItems"][0] })}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => toggleCategory(cat.id, cat.isActive)}>
                    {cat.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteCategory(cat.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Ürünler */}
              {expandedCats.has(cat.id) && (
                <div>
                  {cat.menuItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={getMultiLangValue(item.name)}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          Foto
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{getMultiLangValue(item.name)}</p>
                        <p className="text-xs text-muted-foreground truncate">{getMultiLangValue(item.description)}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs py-0">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right mr-2">
                        <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                        {item.preparationTime && (
                          <p className="text-xs text-muted-foreground">{item.preparationTime} dk</p>
                        )}
                      </div>
                      <Badge variant={item.isAvailable ? "success" : "destructive"}>
                        {item.isAvailable ? "Mevcut" : "Tükendi"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setItemModal({ open: true, categoryId: cat.id, data: item })}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => toggleItem(item.id, item.isAvailable)}>
                          {item.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full border border-dashed border-gray-300 text-muted-foreground hover:border-primary hover:text-primary"
                      onClick={() => setItemModal({ open: true, categoryId: cat.id })}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Ürün Ekle
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <CategoryModal
        open={catModal.open}
        data={catModal.data as unknown as Parameters<typeof CategoryModal>[0]["data"]}
        onClose={() => setCatModal({ open: false })}
        onSave={fetchMenu}
      />
      <MenuItemModal
        open={itemModal.open}
        categoryId={itemModal.categoryId}
        data={itemModal.data}
        onClose={() => setItemModal({ open: false })}
        onSave={fetchMenu}
      />
    </div>
  );
}

function UtensilsCrossedIcon() {
  return (
    <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18M3 21l18-18" />
    </svg>
  );
}
