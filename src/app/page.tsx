import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">QR</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900">QR Menü</h1>
            <p className="text-gray-500 text-sm">Dijital Menü & Ödeme Platformu</p>
          </div>
        </div>

        {/* Slogan */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            Restoranınızı{" "}
            <span className="text-primary">Dijitale Taşıyın</span>
          </h2>
          <p className="text-lg text-gray-600">
            QR kod ile menü, sipariş ve ödeme. Uygulama indirmeye gerek yok.
            Müşterileriniz telefon kameralarını açsın, gerisini biz halledelim.
          </p>
        </div>

        {/* CTA Butonları */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
          >
            Ücretsiz Dene — 14 Gün
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-semibold text-lg hover:border-primary hover:text-primary transition-colors"
          >
            Giriş Yap
          </Link>
        </div>

        {/* Özellikler */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
          {[
            { icon: "🍽️", label: "Dijital Menü" },
            { icon: "📱", label: "QR Sipariş" },
            { icon: "💳", label: "Online Ödeme" },
            { icon: "👨‍🍳", label: "Mutfak Ekranı" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="text-sm font-medium text-gray-700">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
