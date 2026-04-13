"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, getMultiLangValue } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "info" | "secondary" | "destructive" }> = {
  PENDING: { label: "Bekliyor", variant: "warning" },
  PREPARING: { label: "Hazırlanıyor", variant: "info" },
  READY: { label: "Hazır", variant: "success" },
  DELIVERED: { label: "Teslim", variant: "secondary" },
  CANCELLED: { label: "İptal", variant: "destructive" },
};

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  notes?: string;
  table: { number: number };
  orderItems: { id: string; quantity: number; unitPrice: number; status: string; item: { name: unknown } }[];
  payments: { status: string; amount: number; provider: string }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/orders?limit=50");
      const data = await res.json();
      if (data.success) setOrders(data.data.orders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/v1/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
    setSelected(null);
  }

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch = !search || `masa ${o.table.number}`.includes(search.toLowerCase()) || o.id.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
        <Button variant="outline" size="sm" onClick={fetchOrders}><Loader2 className="w-4 h-4 mr-1" />Yenile</Button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="Masa no, sipariş ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["all", "PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === s ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary"}`}
            >
              {s === "all" ? "Tümü" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Masa", "Ürünler", "Tutar", "Durum", "Ödeme", "Zaman", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => {
                const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                const paid = order.payments.some((p) => p.status === "COMPLETED");
                return (
                  <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(order)}>
                    <td className="px-4 py-3 font-bold text-orange-600">#{order.table.number}</td>
                    <td className="px-4 py-3">
                      <p className="truncate max-w-[200px] text-gray-700">
                        {order.orderItems.map((i) => `${i.quantity}x ${getMultiLangValue(i.item.name)}`).join(", ")}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={paid ? "success" : "secondary"}>{paid ? "Ödendi" : "Bekliyor"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-primary hover:underline">Detay</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Sipariş bulunamadı</p>
          )}
        </div>
      )}

      {/* Detay modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">Sipariş — Masa {selected.table.number}</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="space-y-2 mb-4">
              {selected.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {getMultiLangValue(item.item.name)}</span>
                  <span className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
              {selected.notes && <p className="text-xs text-muted-foreground italic">Not: {selected.notes}</p>}
            </div>
            <div className="border-t pt-3 mb-4">
              <div className="flex justify-between font-bold">
                <span>Toplam</span>
                <span>{formatCurrency(selected.totalAmount)}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selected.status === "PENDING" && (
                <Button size="sm" onClick={() => updateStatus(selected.id, "PREPARING")}>Hazırlanıyor</Button>
              )}
              {selected.status === "PREPARING" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(selected.id, "READY")}>Hazır</Button>
              )}
              {selected.status === "READY" && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus(selected.id, "DELIVERED")}>Teslim Edildi</Button>
              )}
              {!["DELIVERED", "CANCELLED"].includes(selected.status) && (
                <Button size="sm" variant="destructive" onClick={() => updateStatus(selected.id, "CANCELLED")}>İptal Et</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
