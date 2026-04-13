"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    slug: "",
    contactEmail: "",
    password: "",
    passwordConfirm: "",
    adminName: "",
  });

  function handleBusinessName(value: string) {
    setForm({ ...form, businessName: value, slug: slugify(value) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kayıt başarısız");
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Sunucu hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşletme Kaydı</CardTitle>
        <CardDescription>14 gün ücretsiz deneyin, kredi kartı gerekmez</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="adminName">Adınız Soyadınız</Label>
            <Input
              id="adminName"
              placeholder="Ali Yılmaz"
              value={form.adminName}
              onChange={(e) => setForm({ ...form, adminName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">İşletme Adı</Label>
            <Input
              id="businessName"
              placeholder="İstanbul Cafe"
              value={form.businessName}
              onChange={(e) => handleBusinessName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">
              Menü Linki{" "}
              <span className="text-muted-foreground text-xs font-normal">(değiştirilebilir)</span>
            </Label>
            <div className="flex items-center border border-input rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
              <span className="px-3 text-sm text-muted-foreground bg-muted border-r border-input py-2 whitespace-nowrap">
                qrmenu.com/
              </span>
              <input
                id="slug"
                className="flex-1 px-3 py-2 text-sm bg-background outline-none"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                required
                pattern="[a-z0-9\-]+"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">E-posta</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="ali@isletme.com"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="En az 8 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Şifre (Tekrar)</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="••••••••"
                value={form.passwordConfirm}
                onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Hesap oluşturuluyor..." : "Ücretsiz Başla"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Giriş yapın
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
