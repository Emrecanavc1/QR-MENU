"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Clock, ChefHat, ShoppingBag, CreditCard, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, getMultiLangValue } from "@/lib/utils";
import Link from "next/link";

interface OrderData {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  table: {
    number: number;
    tenant: {
      name: string;
      slug: string;
      primaryColor: string;
      currency: string;
    };
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    item: {
      name: any;
    };
  }>;
  payments: Array<{
    status: string;
  }>;
}

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/v1/orders/status/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data.order);
      }
    } catch (error) {
      console.error("Order fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // 10 saniyede bir güncelle
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Sipariş Bulunamadı</h1>
        <p className="text-muted-foreground mb-6">Aradığınız sipariş sistemde kayıtlı görünmüyor.</p>
        <Button onClick={() => router.back()}>Geri Dön</Button>
      </div>
    );
  }

  const isPaid = order.payments.some((p) => p.status === "COMPLETED");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-10 h-10 text-orange-500" />;
      case "PREPARING": return <ChefHat className="w-10 h-10 text-blue-500" />;
      case "READY": return <CheckCircle2 className="w-10 h-10 text-green-500" />;
      case "DELIVERED": return <ShoppingBag className="w-10 h-10 text-gray-500" />;
      default: return <Clock className="w-10 h-10 text-orange-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "Siparişiniz Alındı";
      case "PREPARING": return "Hazırlanıyor";
      case "READY": return "Hazır!";
      case "DELIVERED": return "Teslim Edildi";
      default: return "Beklemede";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2"><ChevronLeft /></button>
        <h1 className="font-bold text-lg">Sipariş Takibi</h1>
        <div className="w-8"></div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
          <div className="flex justify-center mb-4">
            {getStatusIcon(order.status)}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{getStatusText(order.status)}</h2>
          <p className="text-gray-500 text-sm">Masaya servis edilecektir.</p>
          
          <div className="mt-8 flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest font-bold">
             <div className="flex flex-col items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${order.status === "PENDING" ? "bg-orange-500 scale-125" : "bg-gray-200"}`}></div>
                <span>Alındı</span>
             </div>
             <div className="h-px bg-gray-200 flex-1 mb-5"></div>
             <div className="flex flex-col items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${order.status === "PREPARING" ? "bg-blue-500 scale-125" : "bg-gray-200"}`}></div>
                <span>Mutfakta</span>
             </div>
             <div className="h-px bg-gray-200 flex-1 mb-5"></div>
             <div className="flex flex-col items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${order.status === "READY" ? "bg-green-500 scale-125" : "bg-gray-200"}`}></div>
                <span>Hazır</span>
             </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-400" />
            Sipariş Özeti
          </h3>
          <div className="space-y-3">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.quantity}x {getMultiLangValue(item.item.name, "tr")}</span>
                <span className="font-medium">{formatCurrency(item.unitPrice * item.quantity, order.table.tenant.currency)}</span>
              </div>
            ))}
            <div className="pt-3 border-t flex justify-between font-bold text-lg">
              <span>Toplam</span>
              <span className="text-primary">{formatCurrency(order.totalAmount, order.table.tenant.currency)}</span>
            </div>
          </div>
        </div>

        {/* Payment Action */}
        {!isPaid && (
          <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 shadow-sm">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                   <CreditCard className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                   <h4 className="font-bold text-gray-900">Henüz Ödenmedi</h4>
                   <p className="text-xs text-gray-500">Ödemenizi şimdi yaparak vakit kazanın.</p>
                </div>
             </div>
             <Link href={`/${order.table.tenant.slug}/masa/${order.table.number}/odeme?orderId=${order.id}`}>
               <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200">
                  Şimdi Öde
               </Button>
             </Link>
          </div>
        )}

        {isPaid && (
          <div className="bg-green-50 rounded-3xl p-6 border border-green-100 flex items-center gap-4">
             <CheckCircle2 className="w-8 h-8 text-green-500" />
             <div>
                <h4 className="font-bold text-green-900">Ödeme Alındı</h4>
                <p className="text-xs text-green-700">Afiyet olsun!</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
