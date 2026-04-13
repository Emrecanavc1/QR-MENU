"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, ChefHat, Loader2, Volume2 } from "lucide-react";
import { getMultiLangValue, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface OrderItem {
  id: string;
  quantity: number;
  status: string;
  notes?: string;
  item: { name: unknown };
  selectedVariant?: { variantName: unknown; option: unknown };
  selectedExtras?: { name: unknown }[];
}

interface KDSOrder {
  id: string;
  status: string;
  notes?: string;
  createdAt: string;
  table: { number: number; name?: string };
  orderItems: OrderItem[];
}

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function OrderCard({ order, onUpdateStatus }: { order: KDSOrder; onUpdateStatus: (orderId: string, status: string) => void }) {
  const [expanded, setExpanded] = useState(true);
  const elapsed = getElapsedMinutes(order.createdAt);
  const urgency = elapsed >= 10 ? "red" : elapsed >= 5 ? "yellow" : "green";
  const urgencyClasses = { red: "border-red-500 bg-red-950/20", yellow: "border-yellow-500 bg-yellow-950/20", green: "border-gray-700 bg-gray-900" };
  const timerClasses = { red: "text-red-400 animate-pulse", yellow: "text-yellow-400", green: "text-green-400" };

  return (
    <div className={`rounded-xl border-2 ${urgencyClasses[urgency]} p-4 transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">Masa {order.table.number}</span>
            {order.table.name && <span className="text-sm text-gray-400">{order.table.name}</span>}
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${timerClasses[urgency]}`}>
            <Clock className="w-3.5 h-3.5" />
            {elapsed} dakika
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            order.status === "PENDING" ? "bg-blue-900 text-blue-200" :
            order.status === "PREPARING" ? "bg-orange-900 text-orange-200" :
            "bg-green-900 text-green-200"
          }`}>
            {order.status === "PENDING" ? "Bekliyor" : order.status === "PREPARING" ? "Hazırlanıyor" : "Hazır"}
          </span>
        </div>
      </div>

      {/* Ürünler */}
      <div className="space-y-2 mb-4">
        {order.orderItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-2">
            <span className="text-orange-400 font-black text-lg w-6 text-center">{item.quantity}x</span>
            <div className="flex-1">
              <p className="text-white font-medium">{getMultiLangValue(item.item.name)}</p>
              {item.selectedVariant && (
                <p className="text-xs text-gray-400">{getMultiLangValue((item.selectedVariant as { option: unknown }).option)}</p>
              )}
              {item.notes && <p className="text-xs text-yellow-400 italic">📝 {item.notes}</p>}
            </div>
            <span className={`text-xs px-2 py-1 rounded ${item.status === "READY" ? "bg-green-800 text-green-200" : "bg-gray-700 text-gray-300"}`}>
              {item.status === "READY" ? "✓" : ""}
            </span>
          </div>
        ))}
        {order.notes && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-2">
            <p className="text-xs text-yellow-300">📋 Sipariş notu: {order.notes}</p>
          </div>
        )}
      </div>

      {/* Aksiyon butonları */}
      <div className="flex gap-2">
        {order.status === "PENDING" && (
          <button
            onClick={() => onUpdateStatus(order.id, "PREPARING")}
            className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            Hazırlanıyor
          </button>
        )}
        {order.status === "PREPARING" && (
          <button
            onClick={() => onUpdateStatus(order.id, "READY")}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Hazır!
          </button>
        )}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrderCount = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/orders?active=true");
      const data = await res.json();
      if (data.success) {
        const active = data.data.orders.filter((o: KDSOrder) => ["PENDING", "PREPARING"].includes(o.status));
        setOrders(active);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function handleUpdateStatus(orderId: string, status: string) {
    await fetch(`/api/v1/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  }

  const pending = orders.filter((o) => o.status === "PENDING");
  const preparing = orders.filter((o) => o.status === "PREPARING");

  return (
    <div className="p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-orange-400" />
          <div>
            <h1 className="text-xl font-black text-white">Mutfak Ekranı</h1>
            <p className="text-xs text-gray-400">{new Date().toLocaleTimeString("tr-TR")}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-blue-400">{pending.length}</p>
            <p className="text-xs text-gray-400">Bekleyen</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-400">{preparing.length}</p>
            <p className="text-xs text-gray-400">Hazırlanan</p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full ${soundEnabled ? "bg-orange-600" : "bg-gray-700"}`}
          >
            <Volume2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Bekleyen sipariş yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...pending, ...preparing].map((order) => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
