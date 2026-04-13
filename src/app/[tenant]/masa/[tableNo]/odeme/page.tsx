"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Banknote, ShieldCheck, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

function PaymentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/v1/orders/status/${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrder(data.data.order);
        setLoading(false);
      });
  }, [orderId]);

  const handlePayment = async (provider: "CASH" | "IYZICO" | "STRIPE") => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/payments/${orderId}/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data.success) {
        if (provider === "CASH") {
          router.push(`/siparis/${orderId}?success=true`);
        } else {
          // Normalde burada ödeme formuna yönlendirme yapılır
          // Test ortamı için direkt başarılı sayıyoruz
          alert("Test Modu: Ödeme başarıyla simüle edildi.");
          router.push(`/siparis/${orderId}?success=true`);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}><ChevronLeft /></button>
        <h1 className="font-bold text-lg">Ödeme Yap</h1>
      </div>

      <div className="p-4 flex-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border text-center">
          <p className="text-sm text-gray-500 mb-1">Ödenecek Tutar</p>
          <h2 className="text-4xl font-extrabold text-gray-900">
            {formatCurrency(order?.totalAmount, order?.table.tenant.currency)}
          </h2>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-400 uppercase px-2">Ödeme Yöntemi Seçin</p>
          
          <button 
            onClick={() => handlePayment("IYZICO")}
            disabled={submitting}
            className="w-full bg-white p-5 rounded-2xl border-2 border-transparent hover:border-orange-500 transition-all flex items-center gap-4 shadow-sm group"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 italic font-black text-orange-600">iyzico</div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">Kredi Kartı / Banka Kartı</p>
              <p className="text-xs text-gray-500">Güvenli online ödeme</p>
            </div>
            <CreditCard className="text-gray-300" />
          </button>

          <button 
            onClick={() => handlePayment("CASH")}
            disabled={submitting}
            className="w-full bg-white p-5 rounded-2xl border-2 border-transparent hover:border-orange-500 transition-all flex items-center gap-4 shadow-sm group"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 text-green-600">
              <Banknote />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">Nakit / Kasada Ödeme</p>
              <p className="text-xs text-gray-500">Ödemeyi masada yapın</p>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs py-4">
          <ShieldCheck className="w-4 h-4" />
          <span>256-bit SSL ile güvenli ödeme</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
