"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface CategoryData {
  id?: string;
  name?: { tr?: string; en?: string };
  availableFrom?: string | null;
  availableTo?: string | null;
  isActive?: boolean;
}

interface Props {
  open: boolean;
  data?: CategoryData | null;
  onClose: () => void;
  onSave: () => void;
}

export function CategoryModal({ open, data, onClose, onSave }: Props) {
  const [form, setForm] = useState({ nameTr: "", nameEn: "", availableFrom: "", availableTo: "" });
  const [loading, setLoading] = useState(false);
  const isEdit = !!data?.id;

  useEffect(() => {
    if (data) {
      setForm({
        nameTr: typeof data.name === "object" && data.name ? (data.name as { tr?: string }).tr ?? "" : "",
        nameEn: typeof data.name === "object" && data.name ? (data.name as { en?: string }).en ?? "" : "",
        availableFrom: data.availableFrom ?? "",
        availableTo: data.availableTo ?? "",
      });
    } else {
      setForm({ nameTr: "", nameEn: "", availableFrom: "", availableTo: "" });
    }
  }, [data, open]);

  if (!open) return null;

  async function handleSave() {
    if (!form.nameTr.trim()) return;
    setLoading(true);
    try {
      const body = {
        name: { tr: form.nameTr, en: form.nameEn || form.nameTr },
        availableFrom: form.availableFrom || null,
        availableTo: form.availableTo || null,
      };
      if (isEdit && data?.id) {
        await fetch(`/api/v1/admin/categories/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/v1/admin/categories", {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isEdit ? "Kategori Düzenle" : "Yeni Kategori"}</h2>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Kategori Adı (Türkçe) *</Label>
            <Input value={form.nameTr} onChange={(e) => setForm({ ...form, nameTr: e.target.value })} placeholder="Sıcak İçecekler" />
          </div>
          <div className="space-y-2">
            <Label>Kategori Adı (İngilizce)</Label>
            <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Hot Beverages" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Başlangıç Saati</Label>
              <Input type="time" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Bitiş Saati</Label>
              <Input type="time" value={form.availableTo} onChange={(e) => setForm({ ...form, availableTo: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Saat kısıtlaması eklerseniz kategori sadece bu saatler arasında görünür (sabah menüsü vb.)</p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
          <Button className="flex-1" onClick={handleSave} disabled={loading || !form.nameTr.trim()}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
