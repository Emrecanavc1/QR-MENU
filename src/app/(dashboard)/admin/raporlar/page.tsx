"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Loader2, TrendingUp, ShoppingBag, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { formatCurrency } from "@/lib/utils";

interface MonthlyData {
  currentRevenue: number;
  prevRevenue: number;
  revenueChange: number;
  currentOrders: number;
  prevOrders: number;
  ordersChange: number;
  dailyRevenue: { day: number; revenue: number; count: number }[];
}

interface DailyData {
  totalRevenue: number;
  totalOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  hourlyRevenue: { hour: number; revenue: number; count: number }[];
  topItems: { id: string; name: unknown; count: number; revenue: number }[];
  paymentMethodDist: Record<string, number>;
}

export default function ReportsPage() {
  const [tab, setTab] = useState<"daily" | "monthly">("daily");
  const [daily, setDaily] = useState<DailyData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });

  const fetchDaily = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/reports/daily?date=${selectedDate}`);
      const data = await res.json();
      if (data.success) setDaily(data.data);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const fetchMonthly = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/reports/monthly?year=${selectedMonth.year}&month=${selectedMonth.month}`);
      const data = await res.json();
      if (data.success) setMonthly(data.data);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { if (tab === "daily") fetchDaily(); }, [tab, fetchDaily]);
  useEffect(() => { if (tab === "monthly") fetchMonthly(); }, [tab, fetchMonthly]);

  function exportCSV() {
    const rows = tab === "daily" && daily
      ? [["Saat", "Gelir", "Sipariş"], ...daily.hourlyRevenue.map((h) => [`${h.hour}:00`, h.revenue, h.count])]
      : monthly
      ? [["Gün", "Gelir", "Sipariş"], ...monthly.dailyRevenue.map((d) => [d.day, d.revenue, d.count])]
      : [];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapor-${tab}-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const PAYMENT_LABELS: Record<string, string> = { IYZICO: "İyzico", STRIPE: "Stripe", CASH: "Nakit" };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-1" />
          CSV İndir
        </Button>
      </div>

      {/* Sekme seçimi */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["daily", "monthly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-gray-700"}`}
          >
            {t === "daily" ? "Günlük" : "Aylık"}
          </button>
        ))}
      </div>

      {/* Tarih seçici */}
      <div className="flex items-center gap-3">
        {tab === "daily" ? (
          <input
            type="date"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={selectedDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        ) : (
          <div className="flex gap-2">
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={selectedMonth.month}
              onChange={(e) => setSelectedMonth({ ...selectedMonth, month: parseInt(e.target.value) })}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString("tr-TR", { month: "long" })}</option>
              ))}
            </select>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={selectedMonth.year}
              onChange={(e) => setSelectedMonth({ ...selectedMonth, year: parseInt(e.target.value) })}
            >
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : tab === "daily" && daily ? (
        <div className="space-y-6">
          {/* Özet kartları */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Toplam Gelir", value: formatCurrency(daily.totalRevenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
              { label: "Toplam Sipariş", value: daily.totalOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "İptal Sipariş", value: daily.cancelledOrders, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
              { label: "Ort. Sepet", value: formatCurrency(daily.avgOrderValue), icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-black text-gray-900 mt-1">{s.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Saatlik gelir grafiği */}
          <RevenueChart
            data={daily.hourlyRevenue.map((h) => ({ label: `${h.hour}:00`, revenue: h.revenue }))}
            title="Saatlik Gelir Dağılımı"
            height={200}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* En çok satanlar */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-4">En Çok Satılan Ürünler</h3>
              {daily.topItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Veri yok</p>
              ) : (
                <div className="space-y-3">
                  {daily.topItems.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{typeof item.name === "object" ? (item.name as Record<string, string>)?.tr ?? "" : String(item.name)}</span>
                          <span className="text-sm text-muted-foreground">{item.count}x · {formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(item.count / (daily.topItems[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ödeme yöntemi dağılımı */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Ödeme Yöntemi Dağılımı</h3>
              {Object.keys(daily.paymentMethodDist).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Veri yok</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(daily.paymentMethodDist).map(([method, amount]) => {
                    const total = Object.values(daily.paymentMethodDist).reduce((s, a) => s + a, 0);
                    const pct = total > 0 ? (amount / total) * 100 : 0;
                    return (
                      <div key={method}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{PAYMENT_LABELS[method] ?? method}</span>
                          <span className="text-muted-foreground">{formatCurrency(amount)} (%{pct.toFixed(0)})</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : tab === "monthly" && monthly ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Aylık Gelir", value: formatCurrency(monthly.currentRevenue), change: monthly.revenueChange },
              { label: "Geçen Ay", value: formatCurrency(monthly.prevRevenue), change: null },
              { label: "Sipariş Sayısı", value: monthly.currentOrders, change: monthly.ordersChange },
              { label: "Geçen Ay Sipariş", value: monthly.prevOrders, change: null },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-black text-gray-900 mt-1">{s.value}</p>
                {s.change !== null && (
                  <p className={`text-xs font-medium mt-1 ${s.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {s.change >= 0 ? "▲" : "▼"} %{Math.abs(s.change).toFixed(1)}
                  </p>
                )}
              </div>
            ))}
          </div>
          <RevenueChart
            data={monthly.dailyRevenue.map((d) => ({ label: `${d.day}`, revenue: d.revenue }))}
            title="Günlük Gelir (Bu Ay)"
            height={200}
          />
        </div>
      ) : null}
    </div>
  );
}
