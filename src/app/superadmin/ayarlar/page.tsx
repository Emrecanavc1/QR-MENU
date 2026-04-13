"use client";

import { useState } from "react";
import { 
  Settings, 
  Globe, 
  Mail, 
  ShieldCheck, 
  Save, 
  Database, 
  Bell, 
  Smartphone,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";

export default function PlatformSettingsPage() {
  const [saving, setSaving] = useState(false);
  
  const handleSave = () => {
    setSaving(true);
    // Simüle edilmiş kayıt işlemi
    setTimeout(() => {
      setSaving(false);
      toast.success("Ayarlar başarıyla kaydedildi.");
    }, 1000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Ayarları</h1>
          <p className="text-muted-foreground mt-1">Sistem genelindeki global ayarları ve yapılandırmaları yönetin.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200">
          {saving ? "Kaydediliyor..." : <><Save className="w-4 h-4 mr-2" /> Değişiklikleri Kaydet</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sol Menü / Kategoriler */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'general', label: 'Genel Yapılandırma', icon: Settings, active: true },
            { id: 'email', label: 'E-Posta (SMTP)', icon: Mail },
            { id: 'security', label: 'Güvenlik & Auth', icon: ShieldCheck },
            { id: 'payment', label: 'Ödeme Altyapısı', icon: CreditCard },
            { id: 'notifications', label: 'Bildirimler', icon: Bell },
            { id: 'mobile', label: 'Mobil Uygulama', icon: Smartphone },
            { id: 'backup', label: 'Veritabanı & Yedek', icon: Database },
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active 
                  ? "bg-white text-orange-600 shadow-sm border border-orange-100" 
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <item.icon className={`w-4 h-4 ${item.active ? "text-orange-500" : ""}`} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Sağ İçerik / Form Alanı */}
        <div className="md:col-span-2 space-y-6">
          {/* Genel Bölüm */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-500" /> Site Bilgileri
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-gray-700">Platform İsmi</label>
                  <Input defaultValue="QR Menü SaaS" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-gray-700">Destek E-Posta</label>
                  <Input defaultValue="destek@qrmenu.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-medium text-gray-700">Meta Başlığı (SEO)</label>
                <Input defaultValue="QR Menü - Temassız Menü ve Sipariş Sistemi" />
              </div>
            </div>
          </div>

          {/* Özellikler / Switchler */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" /> Platform Özellikleri
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Bakım Modu</p>
                  <p className="text-xs text-gray-500">Platformu geçici olarak ziyaretçilere kapatın.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Yeni Üyelik Alımı</p>
                  <p className="text-xs text-gray-500">Yeni işletmelerin sisteme kayıt olmasını kontrol edin.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">E-Posta Doğrulama</p>
                  <p className="text-xs text-gray-500">İşletme sahipleri için e-posta onayı zorunluluğu.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* İleri Seviye */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" /> Finansal Ayarlar
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="font-medium text-gray-700">Global Komisyon Oranı (%)</label>
                <Input type="number" defaultValue="2.5" />
                <p className="text-[10px] text-gray-400 italic">Eğer işletmenin özel bir oranı yoksa bu değer baz alınır.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
