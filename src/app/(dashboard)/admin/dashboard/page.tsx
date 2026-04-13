"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, ShoppingBag, Table2, Users,
  Loader2, RefreshCw, Clock,
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, getMultiLangValue } from "@/lib/utils";

interface DashboardData {
  todayRevenue: number;
  todayOrders: number;
  activeTables: number;
  totalTables: number;
  recentOrders: {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    table: { number: number };
    orderItems: { quantity: number; unitPrice: number }[];
  }[];
  topItems: { itemId: string; name: unknown; _sum: { quantity: number | null } }[];
  hourlyRevenue: { hour: number; revenue: number }[];
}

const ORDER_STATUS: Record<string, { label: string; variant: "success" | "warning" | "info" | "secondary" | "destructive" }> = {
  PENDING: { label: "Bekliyor", variant: "warning" },
  PREPARING: { label: "Hazırlanıyor", variant: "info" },
  READY: { label: "Hazır", variant: "success" },
  DELIVERED: { label: "Teslim", variant: "secondary" },
  CANCELLED: { label: "İptal", variant: "destructive" },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const hourlyChartData = data.hourlyRevenue.map((h) => ({
    label: `${h.hour}:00`,
    revenue: h.revenue,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="w-3.5 h-3.5" />
            Son güncelleme: {lastUpdated.toLocaleTimeString("tr-TR")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Yenile
        </Button>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Bugünkü Gelir"
          value={formatCurrency(data.todayRevenue)}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          subtitle="Tamamlanan ödemeler"
        />
        <StatsCard
          title="Bugünkü Siparişler"
          value={data.todayOrders}
          icon={ShoppingBag}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          subtitle={`Ort. ${data.todayOrders > 0 ? formatCurrency(data.todayRevenue / data.todayOrders) : "₺0"} / sipariş`}
        />
        <StatsCard
          title="Aktif Masalar"
          value={`${data.activeTables} / ${data.totalTables}`}
          icon={Table2}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          subtitle={`%${Math.round((data.activeTables / (data.totalTables || 1)) * 100)} doluluk`}
        />
        <StatsCard
          title="Bekleyen Sipariş"
          value={data.recentOrders.filter((o) => ["PENDING", "PREPARING"].includes(o.status)).length}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          subtitle="Mutfakta işlemde"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saatlik gelir grafiği */}
        <div className="lg:col-span-2">
          <RevenueChart
            data={hourlyChartData}
            title="Son 12 Saatlik Gelir"
            height={180}
          />
        </div>

        {/* En çok satanlar */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">En Çok Satanlar (Bugün)</h3>
          {data.topItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Henüz satış yok</p>
          ) : (
            <div className="space-y-3">
              {data.topItems.map((item, i) => (
                <div key={item.itemId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm font-medium text-gray-800 truncate">
                    {getMultiLangValue(item.name)}
                  </p>
                  <span className="text-sm font-bold text-primary">{item._sum.quantity ?? 0}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Son siparişler */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Son Siparişler</h3>
          <Button variant="ghost" size="sm" asChild>
            <a href="/admin/siparisler">Tümünü gör</a>
          </Button>
        </div>
        <div className="divide-y divide-gray-50">
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Henüz sipariş yok</p>
          ) : (
            data.recentOrders.map((order) => {
              const st = ORDER_STATUS[order.status] ?? ORDER_STATUS.PENDING;
              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center font-bold text-orange-600 text-sm flex-shrink-0">
                    {order.table.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Masa {order.table.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.orderItems.length} kalem · {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Badge variant={st.variant}>{st.label}</Badge>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
