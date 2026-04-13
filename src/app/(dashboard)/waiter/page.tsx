"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle, Loader2, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getMultiLangValue } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface TableData {
  id: string;
  number: number;
  name: string | null;
  status: string;
  location: { name: string } | null;
  orders: {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    orderItems: { id: string; quantity: number; status: string; item: { name: unknown } }[];
  }[];
}

const STATUS_STYLES: Record<string, string> = {
  EMPTY: "bg-white border-gray-200 text-gray-400",
  OCCUPIED: "bg-orange-50 border-orange-200",
  WAITING_PAYMENT: "bg-blue-50 border-blue-300",
};

const STATUS_LABELS: Record<string, string> = {
  EMPTY: "Boş",
  OCCUPIED: "Dolu",
  WAITING_PAYMENT: "Ödeme Bekliyor",
};

export default function WaiterPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [readyOrders, setReadyOrders] = useState<string[]>([]);

  const fetchTables = useCallback(async () => {
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        fetch("/api/v1/admin/tables"),
        fetch("/api/v1/admin/orders?active=true"),
      ]);
      const [tablesData, ordersData] = await Promise.all([tablesRes.json(), ordersRes.json()]);

      if (tablesData.success && ordersData.success) {
        const ordersByTable: Record<string, TableData["orders"]> = {};
        for (const order of ordersData.data.orders) {
          if (!ordersByTable[order.tableId]) ordersByTable[order.tableId] = [];
          ordersByTable[order.tableId].push(order);
        }
        const enrichedTables = tablesData.data.tables.map((t: TableData) => ({
          ...t,
          orders: ordersByTable[t.id] ?? [],
        }));
        setTables(enrichedTables);
        // Hazır siparişleri bul
        const ready = ordersData.data.orders.filter((o: { status: string }) => o.status === "READY").map((o: { id: string }) => o.id);
        setReadyOrders(ready);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 8000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  async function markDelivered(orderId: string) {
    await fetch(`/api/v1/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DELIVERED" }),
    });
    fetchTables();
    setSelectedTable(null);
  }

  const occupied = tables.filter((t) => t.status !== "EMPTY");
  const readyCount = readyOrders.length;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Garson Paneli</h1>
          <p className="text-sm text-muted-foreground">{user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {readyCount > 0 && (
            <div className="flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium animate-pulse">
              <Bell className="w-4 h-4" />
              {readyCount} sipariş hazır
            </div>
          )}
          <Button size="icon" variant="ghost" onClick={fetchTables}><RefreshCw className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={() => { logout(); router.push("/login"); }}><LogOut className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Toplam Masa", value: tables.length, color: "text-gray-900" },
          { label: "Dolu Masa", value: occupied.length, color: "text-orange-600" },
          { label: "Hazır Sipariş", value: readyCount, color: "text-green-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tables.map((table) => {
            const hasReadyOrder = table.orders.some((o) => readyOrders.includes(o.id));
            const totalAmount = table.orders.reduce((s, o) => s + o.totalAmount, 0);
            return (
              <button
                key={table.id}
                onClick={() => table.status !== "EMPTY" && setSelectedTable(table)}
                className={`border-2 rounded-xl p-4 text-left transition-all ${STATUS_STYLES[table.status]} ${
                  hasReadyOrder ? "ring-2 ring-green-400 ring-offset-1" : ""
                } ${table.status === "EMPTY" ? "cursor-default" : "hover:shadow-md"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xl font-black text-gray-900">{table.number}</span>
                  {hasReadyOrder && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                </div>
                <p className="text-xs text-muted-foreground">{table.name ?? `Masa ${table.number}`}</p>
                <p className="text-xs text-muted-foreground">{table.location?.name ?? ""}</p>
                <div className="mt-2">
                  <Badge variant={table.status === "EMPTY" ? "secondary" : table.status === "WAITING_PAYMENT" ? "info" : "warning"} className="text-xs">
                    {STATUS_LABELS[table.status]}
                  </Badge>
                </div>
                {totalAmount > 0 && (
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(totalAmount)}</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Masa detay modali */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Masa {selectedTable.number}</h2>
              <button onClick={() => setSelectedTable(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              {selectedTable.orders.map((order) => (
                <div key={order.id} className={`border rounded-xl p-4 ${readyOrders.includes(order.id) ? "border-green-400 bg-green-50" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={order.status === "READY" ? "success" : order.status === "PREPARING" ? "warning" : "secondary"}>
                      {order.status === "READY" ? "Hazır" : order.status === "PREPARING" ? "Hazırlanıyor" : "Bekliyor"}
                    </Badge>
                    <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex gap-2 text-sm text-gray-600">
                      <span className="font-medium">{item.quantity}x</span>
                      <span>{getMultiLangValue(item.item.name)}</span>
                    </div>
                  ))}
                  {order.status === "READY" && (
                    <Button size="sm" className="w-full mt-3 bg-green-600 hover:bg-green-700" onClick={() => markDelivered(order.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Teslim Edildi
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
