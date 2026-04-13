"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, ExternalLink, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface Tenant {
  id: string; slug: string; name: string; contactEmail: string;
  plan: string; status: string; createdAt: string;
  customDomain: string | null;
  subscription: { currentPeriodEnd: string; trialEndsAt: string | null } | null;
  _count: { orders: number };
}

const PLAN_OPTS = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"];
const STATUS_OPTS = ["ACTIVE", "TRIAL", "SUSPENDED", "CANCELLED"];
const PLAN_L: Record<string, string> = { FREE: "Ücretsiz", STARTER: "Başlangıç", PROFESSIONAL: "Profesyonel", ENTERPRISE: "Kurumsal" };
const STATUS_V: Record<string, "success" | "warning" | "destructive" | "secondary"> = { ACTIVE: "success", TRIAL: "warning", SUSPENDED: "destructive", CANCELLED: "secondary" };
const STATUS_L: Record<string, string> = { ACTIVE: "Aktif", TRIAL: "Deneme", SUSPENDED: "Askıda", CANCELLED: "İptal" };

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ plan: "", status: "", customDomain: "" });
  const [saving, setSaving] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addForm, setAddForm] = useState({ name: "", slug: "", contactEmail: "", adminPassword: "" });

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/superadmin/tenants");
    const data = await res.json();
    if (data.success) setTenants(data.data.tenants);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch("/api/v1/superadmin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.success) {
        setAddModal(false);
        setAddForm({ name: "", slug: "", contactEmail: "", adminPassword: "" });
        fetchTenants();
      } else {
        setAddError(data.error || "İşletme eklenirken bir hata oluştu");
      }
    } catch (err) {
      setAddError("Bağlantı hatası oluştu");
    } finally {
      setAdding(false);
    }
  }

  function openEdit(tenant: Tenant) {
    setSelected(tenant);
    setEditForm({ plan: tenant.plan, status: tenant.status, customDomain: tenant.customDomain ?? "" });
    setEditModal(true);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch(`/api/v1/superadmin/tenants/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: editForm.plan,
          status: editForm.status,
          customDomain: editForm.customDomain || null,
        }),
      });
      fetchTenants();
      setEditModal(false);
    } finally {
      setSaving(false);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const platformName = (process.env.NEXT_PUBLIC_APP_NAME ?? "qrmenu").toLowerCase().replace(/\s+/g, "");

  const filtered = tenants.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search) || t.contactEmail.includes(search);
    const matchPlan = planFilter === "all" || t.plan === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İşletmeler</h1>
          <p className="text-sm text-muted-foreground mt-1">{tenants.length} işletme kayıtlı</p>
        </div>
        <Button onClick={() => setAddModal(true)} className="bg-orange-600 hover:bg-orange-700">
          Yeni İşletme Ekle
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="İşletme adı, slug veya e-posta..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["all", ...PLAN_OPTS].map((p) => (
            <button key={p} onClick={() => setPlanFilter(p)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${planFilter === p ? "bg-orange-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-orange-400"}`}>
              {p === "all" ? "Tümü" : PLAN_L[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["İşletme", "Plan", "Durum", "Domain", "Sipariş", "Kayıt", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((tenant) => {
                const menuUrl = tenant.customDomain
                  ? `https://${tenant.customDomain}`
                  : `${appUrl}/${tenant.slug}/masa/1`;
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">{tenant.contactEmail}</p>
                      <p className="text-xs text-muted-foreground font-mono">{tenant.slug}</p>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary">{PLAN_L[tenant.plan]}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={STATUS_V[tenant.status]}>{STATUS_L[tenant.status]}</Badge></td>
                    <td className="px-4 py-3">
                      {tenant.customDomain ? (
                        <div>
                          <p className="text-xs font-mono text-blue-700">{platformName}.{tenant.customDomain}</p>
                          <p className="text-xs text-muted-foreground">Özel domain</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{tenant._count.orders}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(tenant.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="w-8 h-8" asChild>
                          <a href={menuUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => openEdit(tenant)}>
                          <Settings2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">İşletme bulunamadı</p>}
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-1">{selected.name}</h2>
            <p className="text-xs text-muted-foreground mb-5">{selected.contactEmail}</p>
            <div className="space-y-4">
              {/* Plan */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Abonelik Planı</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLAN_OPTS.map((p) => (
                    <button type="button" key={p} onClick={() => setEditForm({ ...editForm, plan: p })}
                      className={`py-2 rounded-lg text-sm border transition-colors ${editForm.plan === p ? "bg-orange-600 text-white border-orange-600" : "border-gray-200 text-gray-700 hover:border-orange-400"}`}>
                      {PLAN_L[p]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Durum */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Hesap Durumu</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTS.map((s) => (
                    <button type="button" key={s} onClick={() => setEditForm({ ...editForm, status: s })}
                      className={`py-2 rounded-lg text-sm border transition-colors ${editForm.status === s ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}>
                      {STATUS_L[s]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Özel Domain */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Özel Domain</label>
                <div className="flex items-center border border-input rounded-md overflow-hidden">
                  <span className="px-3 py-2 text-xs text-muted-foreground bg-muted border-r whitespace-nowrap">
                    {(process.env.NEXT_PUBLIC_APP_NAME ?? "flare").toLowerCase()}.
                  </span>
                  <input
                    className="flex-1 px-3 py-2 text-sm bg-background outline-none"
                    value={editForm.customDomain}
                    onChange={(e) => setEditForm({ ...editForm, customDomain: e.target.value })}
                    placeholder="cafe-istanbul.com"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditModal(false)}>İptal</Button>
              <Button type="button" className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={handleSave} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Yeni İşletme Ekle Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Yeni İşletme Ekle</h2>
            {addError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{addError}</div>}
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">İşletme Adı</label>
                <Input required value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} placeholder="Örn: Lezzet Restoran" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Kısa Ad (Slug)</label>
                <Input required value={addForm.slug} onChange={(e) => setAddForm({...addForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")})} placeholder="Örn: lezzet-restoran" />
                <p className="text-xs text-muted-foreground mt-1">Sadece küçük harf ve tire. URL'de kullanılır.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Yönetici E-posta</label>
                <Input required type="email" value={addForm.contactEmail} onChange={(e) => setAddForm({...addForm, contactEmail: e.target.value})} placeholder="admin@lezzet.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Yönetici Şifre</label>
                <Input required type="password" value={addForm.adminPassword} onChange={(e) => setAddForm({...addForm, adminPassword: e.target.value})} placeholder="En az 6 karakter" />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setAddModal(false)}>İptal</Button>
                <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800" disabled={adding}>
                  {adding ? "Ekleniyor..." : "İşletme Ekle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
