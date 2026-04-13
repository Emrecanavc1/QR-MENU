"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, UserCheck, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface StaffUser {
  id: string; name: string; email: string; role: string; isActive: boolean; lastLoginAt: string | null;
}

const ROLE_CONFIG = {
  WAITER: { label: "Garson", icon: UserCheck, color: "bg-blue-50 text-blue-700" },
  KITCHEN: { label: "Mutfak", icon: ChefHat, color: "bg-orange-50 text-orange-700" },
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<StaffUser | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", pin: "", role: "WAITER" });
  const [saving, setSaving] = useState(false);

  const fetchStaff = useCallback(async () => {
    const res = await fetch("/api/v1/admin/users");
    const data = await res.json();
    if (data.success) setStaff(data.data.users);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  function openCreate() { setEditUser(null); setForm({ name: "", email: "", password: "", pin: "", role: "WAITER" }); setModalOpen(true); }
  function openEdit(user: StaffUser) { setEditUser(user); setForm({ name: user.name, email: user.email ?? "", password: "", pin: "", role: user.role }); setModalOpen(true); }

  async function handleSave() {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editUser) {
        await fetch(`/api/v1/admin/users/${editUser.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, ...(form.password && { password: form.password }), ...(form.pin && { pin: form.pin }) }),
        });
      } else {
        await fetch("/api/v1/admin/users", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form }),
        });
      }
      fetchStaff();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/v1/admin/users/${id}`, { method: "DELETE" });
    fetchStaff();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/v1/admin/users/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchStaff();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personel Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-1">{staff.length} personel</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Personel Ekle</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {staff.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>Henüz personel eklenmemiş</p>
              <Button className="mt-4" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />İlk Personeli Ekle</Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Personel", "Rol", "Giriş Yöntemi", "Son Giriş", "Durum", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.map((user) => {
                  const roleConf = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG];
                  const Icon = roleConf?.icon ?? UserCheck;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleConf?.color ?? ""}`}>
                          <Icon className="w-3 h-3" />
                          {roleConf?.label ?? user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {user.email ? "E-posta + PIN" : "Sadece PIN"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(user.id, user.isActive)}>
                          <Badge variant={user.isActive ? "success" : "secondary"}>
                            {user.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => openEdit(user)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-8 h-8 text-destructive" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editUser ? "Personeli Düzenle" : "Yeni Personel"}</h2>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Ad Soyad *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              {!editUser && (
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="WAITER">Garson</option>
                    <option value="KITCHEN">Mutfak</option>
                  </select>
                </div>
              )}
              <div className="space-y-2"><Label>E-posta (opsiyonel)</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>{editUser ? "Yeni Şifre" : "Şifre"}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editUser ? "Değiştirmek için girin" : ""} /></div>
                <div className="space-y-2"><Label>PIN (4 hane)</Label><Input type="password" maxLength={4} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} placeholder="1234" /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>İptal</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving || !form.name}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
