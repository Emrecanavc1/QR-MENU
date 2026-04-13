"use client";

import { useState, useEffect } from "react";
import { Building2, Users, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  totalRevenue: number;
  recentTenants: { id: string; name: string; slug: string; plan: string; status: string; createdAt: string }[];
}

const PLAN_LABELS: Record<string, string> = { FREE: "Ücretsiz", STARTER: "Başlangıç", PROFESSIONAL: "Profesyonel", ENTERPRISE: "Kurumsal" };
const STATUS_V: Record<string, "success" | "warning" | "destructive" | "secondary"> = { ACTIVE: "success", TRIAL: "warning", SUSPENDED: "destructive", CANCELLED: "secondary" };
const STATUS_L: Record<string, string> = { ACTIVE: "Aktif", TRIAL: "Deneme", SUSPENDED: "Askıda", CANCELLED: "İptal" };

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/superadmin/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>;
  if (!stats) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Toplam İşletme" value={stats.totalTenants} icon={Building2} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Aktif İşletme" value={stats.activeTenants} icon={Users} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Deneme Süreci" value={stats.trialTenants} icon={AlertCircle} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatsCard title="Platform Geliri" value={formatCurrency(stats.totalRevenue)} icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Son Kayıt Olan İşletmeler</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.recentTenants.map((tenant) => (
            <div key={tenant.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center font-bold text-orange-600 text-sm flex-shrink-0">
                {tenant.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{tenant.name}</p>
                <p className="text-xs text-muted-foreground">{tenant.slug}</p>
              </div>
              <Badge variant="secondary">{PLAN_LABELS[tenant.plan] ?? tenant.plan}</Badge>
              <Badge variant={STATUS_V[tenant.status] ?? "secondary"}>{STATUS_L[tenant.status] ?? tenant.status}</Badge>
              <p className="text-xs text-muted-foreground">{new Date(tenant.createdAt).toLocaleDateString("tr-TR")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
