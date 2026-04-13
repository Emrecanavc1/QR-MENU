export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">QR</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">QR Menü</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
