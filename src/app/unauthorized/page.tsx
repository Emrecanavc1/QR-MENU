import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">403</h1>
        <p className="text-lg text-muted-foreground">Bu sayfaya erişim yetkiniz yok.</p>
        <Button asChild>
          <Link href="/login">Giriş Sayfasına Dön</Link>
        </Button>
      </div>
    </div>
  );
}
