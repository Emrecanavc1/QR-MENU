"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { Table, Location } from "@/types";

interface Props {
  open: boolean;
  data?: Partial<Table> | null;
  locations: Location[];
  onClose: () => void;
  onSave: () => void;
}

export function TableModal({ open, data, locations, onClose, onSave }: Props) {
  const isEdit = !!data?.id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ number: "", name: "", capacity: "4", locationId: "" });

  useEffect(() => {
    if (data) {
      setForm({
        number: data.number?.toString() ?? "",
        name: data.name ?? "",
        capacity: data.capacity?.toString() ?? "4",
        locationId: data.locationId ?? "",
      });
    } else {
      setForm({ number: "", name: "", capacity: "4", locationId: locations[0]?.id ?? "" });
    }
  }, [data, open, locations]);

  if (!open) return null;

  async function handleSave() {
    if (!form.number) return;
    setLoading(true);
    try {
      const body = {
        number: parseInt(form.number),
        name: form.name || `Masa ${form.number}`,
        capacity: parseInt(form.capacity),
        locationId: form.locationId || null,
      };
      if (isEdit && data?.id) {
        await fetch(`/api/v1/admin/tables/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/v1/admin/tables", {
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
      <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isEdit ? "Masa Düzenle" : "Yeni Masa"}</h2>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Masa Numarası *</Label>
              <Input type="number" min="1" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label>Kapasite</Label>
              <Input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="4" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Masa Adı (opsiyonel)</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VIP Masa, Pencere kenarı..." />
          </div>
          <div className="space-y-2">
            <Label>Bölge</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
            >
              <option value="">Bölge seçin</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
          <Button className="flex-1" onClick={handleSave} disabled={loading || !form.number}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
