"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Loader2, Save, Upload, Globe, Palette, Wifi, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface TenantSettings {
  id: string; slug: string; name: string; logoUrl: string | null; coverUrl: string | null;
  contactEmail: string; phone: string | null; address: string | null;
  currency: string; taxRate: number; primaryColor: string;
  wifiName: string | null; wifiPassword: string | null;
  instagramUrl: string | null; facebookUrl: string | null; twitterUrl: string | null;
  workingHours: Record<string, { open: string; close: string; closed: boolean }> | null;
}

const DAYS = [
  { key: "monday", label: "Pazartesi" },
  { key: "tuesday", label: "Salı" },
  { key: "wednesday", label: "Çarşamba" },
  { key: "thursday", label: "Perşembe" },
  { key: "friday", label: "Cuma" },
  { key: "saturday", label: "Cumartesi" },
  { key: "sunday", label: "Pazar" },
];

const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map(({ key }) => [key, { open: "09:00", close: "22:00", closed: false }])
);

const CURRENCIES = ["TRY", "USD", "EUR", "GBP"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [form, setForm] = useState<Partial<TenantSettings & { workingHoursData: typeof DEFAULT_HOURS }>>({});
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/v1/admin/settings");
    const data = await res.json();
    if (data.success) {
      setSettings(data.data.tenant);
      setForm({
        ...data.data.tenant,
        workingHoursData: data.data.tenant.workingHours ?? DEFAULT_HOURS,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  async function handleUpload(file: File, folder: "logos" | "covers") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/v1/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) {
      if (folder === "logos") setForm((prev) => ({ ...prev, logoUrl: data.data.url }));
      else setForm((prev) => ({ ...prev, coverUrl: data.data.url }));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form, workingHours: form.workingHoursData };
      delete (payload as Record<string, unknown>).workingHoursData;
      const res = await fetch("/api/v1/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSavedMsg("Ayarlar kaydedildi!");
        setTimeout(() => setSavedMsg(""), 3000);
        fetchSettings();
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!settings) return null;

  const wh = form.workingHoursData ?? DEFAULT_HOURS;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">İşletme Ayarları</h1>
        <div className="flex items-center gap-3">
          {savedMsg && <span className="text-sm text-green-600 font-medium">{savedMsg}</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Kaydet
          </Button>
        </div>
      </div>

      {/* Genel Bilgiler */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Globe className="w-4 h-4 text-primary" />Genel Bilgiler</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>İşletme Adı</Label>
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Menü URL'si (slug)</Label>
            <div className="flex items-center border border-input rounded-md overflow-hidden">
              <span className="px-3 text-xs text-muted-foreground bg-muted border-r py-2 whitespace-nowrap">{process.env.NEXT_PUBLIC_APP_URL}/</span>
              <span className="px-3 py-2 text-sm text-gray-700">{settings.slug}</span>
            </div>
            <p className="text-xs text-muted-foreground">Slug değiştirilemez.</p>
          </div>
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input type="email" value={form.contactEmail ?? ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+90 555 000 00 00" />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Adres</Label>
            <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="İstanbul, Türkiye" />
          </div>
        </div>
      </section>

      {/* Logo & Kapak */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Upload className="w-4 h-4 text-primary" />Görsel Ayarları</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Logo */}
          <div className="space-y-3">
            <Label>İşletme Logosu</Label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => logoInputRef.current?.click()}
            >
              {form.logoUrl
                ? <Image src={form.logoUrl} alt="logo" width={80} height={80} className="w-20 h-20 rounded-full object-cover" />
                : <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">📷</div>}
              <p className="text-xs text-muted-foreground">Tıklayarak yükle (JPG/PNG, maks 5MB)</p>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "logos")} />
          </div>
          {/* Kapak */}
          <div className="space-y-3">
            <Label>Kapak Fotoğrafı</Label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => coverInputRef.current?.click()}
            >
              {form.coverUrl
                ? <Image src={form.coverUrl} alt="cover" width={160} height={80} className="w-full h-20 rounded-lg object-cover" />
                : <div className="w-full h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">🖼️</div>}
              <p className="text-xs text-muted-foreground">Tıklayarak yükle (16:9 önerilir)</p>
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "covers")} />
          </div>
        </div>
      </section>

      {/* Tema & Para Birimi */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Palette className="w-4 h-4 text-primary" />Tema & Finans</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Ana Renk</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.primaryColor ?? "#f97316"}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <Input value={form.primaryColor ?? "#f97316"} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="font-mono text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Para Birimi</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.currency ?? "TRY"}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>KDV Oranı (%)</Label>
            <Input
              type="number" min="0" max="100" step="0.1"
              value={form.taxRate ?? 8}
              onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </section>

      {/* Wi-Fi & Sosyal */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Wifi className="w-4 h-4 text-primary" />Wi-Fi & Sosyal Medya</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Wi-Fi Adı (SSID)</Label>
            <Input value={form.wifiName ?? ""} onChange={(e) => setForm({ ...form, wifiName: e.target.value })} placeholder="Cafe_WiFi" />
          </div>
          <div className="space-y-2">
            <Label>Wi-Fi Şifresi</Label>
            <Input value={form.wifiPassword ?? ""} onChange={(e) => setForm({ ...form, wifiPassword: e.target.value })} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Instagram URL</Label>
            <Input value={form.instagramUrl ?? ""} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-2">
            <Label>Facebook URL</Label>
            <Input value={form.facebookUrl ?? ""} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} placeholder="https://facebook.com/..." />
          </div>
        </div>
      </section>

      {/* Çalışma Saatleri */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Çalışma Saatleri</h2>
        <div className="space-y-2">
          {DAYS.map(({ key, label }) => {
            const day = wh[key] ?? { open: "09:00", close: "22:00", closed: false };
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-28 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!day.closed}
                    onChange={(e) => setForm((prev) => ({ ...prev, workingHoursData: { ...wh, [key]: { ...day, closed: !e.target.checked } } }))}
                    className="accent-orange-500"
                  />
                  <span className={`text-sm font-medium ${day.closed ? "text-gray-400" : "text-gray-700"}`}>{label}</span>
                </div>
                {day.closed ? (
                  <span className="text-sm text-gray-400 italic">Kapalı</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input type="time" value={day.open}
                      onChange={(e) => setForm((prev) => ({ ...prev, workingHoursData: { ...wh, [key]: { ...day, open: e.target.value } } }))}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                    <span className="text-muted-foreground text-sm">—</span>
                    <input type="time" value={day.close}
                      onChange={(e) => setForm((prev) => ({ ...prev, workingHoursData: { ...wh, [key]: { ...day, close: e.target.value } } }))}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
