"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { formatCurrency } from "@/lib/utils";

interface PlatformReportData {
  totalRevenue: number;
  totalOrders: number;
  activeTenants: number;
  newTenants: number;
  monthlyRevenue: { month: string; revenue: number; tenants: number }[];
  topTenants: { id: string; name: string; revenue: number; orders: number }[];
}

export default function SuperAdminReports() {
  const [data, setData] = useState<PlatformReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/superadmin/reports");
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  function exportCSV() {
    if (!data) return;
    const rows = [
      ["Ay", "Gelir", "Yeni Tenant"],
      ...data.monthlyRevenue.map((m) => [m.month, m.revenue, m.tenants]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platform-rapor.csv";
    a.click();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>;
  if (!data) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Platform Raporları</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV İndir</Button>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Platform Toplam Geliri", value: formatCurrency(data.totalRevenue) },
          { label: "Toplam Sipariş", value: data.totalOrders.toLocaleString("tr-TR") },
          { label: "Aktif İşletme", value: data.activeTenants },
          { label: "Bu Ay Yeni", value: data.newTenants },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Aylık gelir grafiği */}
      <RevenueChart
        data={data.monthlyRevenue.map((m) => ({ label: m.month, revenue: m.revenue }))}
        title="Aylık Platform Geliri"
        height={200}
      />

      {/* En çok gelir getiren işletmeler */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">En Çok Gelir Getiren İşletmeler</h2>
        <div className="space-y-3">
          {data.topTenants.map((t, i) => (
            <div key={t.id} className="flex items-center gap-3">
              <span className="w-6 text-sm text-muted-foreground font-bold text-right">{i + 1}.</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">{t.orders} sipariş · {formatCurrency(t.revenue)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${(t.revenue / (data.topTenants[0]?.revenue || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {data.topTenants.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Henüz veri yok</p>}
        </div>
      </div>
    </div>
  );
}
