"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2 } from "lucide-react";
import type { MenuItem } from "@/types";

const ALLERGENS = ["GLUTEN", "MILK", "EGGS", "PEANUTS", "TREE_NUTS", "SOY", "FISH", "SHELLFISH", "SESAME", "CELERY", "MUSTARD", "LUPIN", "MOLLUSCS", "SULPHITES"];
const TAGS = ["VEGAN", "VEGETARIAN", "GLUTEN_FREE", "HOT", "COLD", "NEW", "RECOMMENDED", "SPICY", "ALCOHOL_FREE"];

interface Props {
  open: boolean;
  categoryId?: string;
  data?: Partial<MenuItem> | null;
  onClose: () => void;
  onSave: () => void;
}

export function MenuItemModal({ open, categoryId, data, onClose, onSave }: Props) {
  const isEdit = !!data?.id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nameTr: "", nameEn: "",
    descTr: "", descEn: "",
    price: "",
    calories: "",
    preparationTime: "",
    allergens: [] as string[],
    tags: [] as string[],
    isAvailable: true,
  });

  useEffect(() => {
    if (data) {
      const name = data.name as Record<string, string> | undefined;
      const desc = data.description as Record<string, string> | undefined;
      setForm({
        nameTr: name?.tr ?? "",
        nameEn: name?.en ?? "",
        descTr: desc?.tr ?? "",
        descEn: desc?.en ?? "",
        price: data.price?.toString() ?? "",
        calories: data.calories?.toString() ?? "",
        preparationTime: data.preparationTime?.toString() ?? "",
        allergens: data.allergens ?? [],
        tags: data.tags ?? [],
        isAvailable: data.isAvailable ?? true,
      });
    } else {
      setForm({ nameTr: "", nameEn: "", descTr: "", descEn: "", price: "", calories: "", preparationTime: "", allergens: [], tags: [], isAvailable: true });
    }
  }, [data, open]);

  if (!open) return null;

  function toggleArr(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  async function handleSave() {
    if (!form.nameTr || !form.price) return;
    setLoading(true);
    try {
      const body = {
        categoryId: categoryId ?? data?.categoryId,
        name: { tr: form.nameTr, en: form.nameEn || form.nameTr },
        description: { tr: form.descTr, en: form.descEn || form.descTr },
        price: parseFloat(form.price),
        calories: form.calories ? parseInt(form.calories) : null,
        preparationTime: form.preparationTime ? parseInt(form.preparationTime) : null,
        allergens: form.allergens,
        tags: form.tags,
        isAvailable: form.isAvailable,
      };
      if (isEdit && data?.id) {
        await fetch(`/api/v1/admin/items/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/v1/admin/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      onSave();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isEdit ? "Ürün Düzenle" : "Yeni Ürün"}</h2>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="space-y-4">
          {/* Adlar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ürün Adı (TR) *</Label>
              <Input value={form.nameTr} onChange={(e) => setForm({ ...form, nameTr: e.target.value })} placeholder="Americano" />
            </div>
            <div className="space-y-2">
              <Label>Ürün Adı (EN)</Label>
              <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Americano" />
            </div>
          </div>

          {/* Açıklamalar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Açıklama (TR)</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.descTr}
                onChange={(e) => setForm({ ...form, descTr: e.target.value })}
                placeholder="Espresso + sıcak su"
              />
            </div>
            <div className="space-y-2">
              <Label>Açıklama (EN)</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.descEn}
                onChange={(e) => setForm({ ...form, descEn: e.target.value })}
                placeholder="Espresso + hot water"
              />
            </div>
          </div>

          {/* Fiyat, Kalori, Süre */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Fiyat (₺) *</Label>
              <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="45.00" />
            </div>
            <div className="space-y-2">
              <Label>Kalori (kcal)</Label>
              <Input type="number" min="0" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="250" />
            </div>
            <div className="space-y-2">
              <Label>Hazırlanma (dk)</Label>
              <Input type="number" min="0" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })} placeholder="10" />
            </div>
          </div>

          {/* Etiketler */}
          <div className="space-y-2">
            <Label>Etiketler</Label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setForm({ ...form, tags: toggleArr(form.tags, tag) })}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    form.tags.includes(tag)
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 text-gray-600 hover:border-primary"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Alerjenler */}
          <div className="space-y-2">
            <Label>Alerjenler</Label>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((allergen) => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => setForm({ ...form, allergens: toggleArr(form.allergens, allergen) })}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    form.allergens.includes(allergen)
                      ? "bg-orange-100 text-orange-800 border-orange-300"
                      : "border-gray-300 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          {/* Stok */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isAvailable"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="isAvailable">Ürün mevcut (stokta var)</Label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
          <Button className="flex-1" onClick={handleSave} disabled={loading || !form.nameTr || !form.price}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
