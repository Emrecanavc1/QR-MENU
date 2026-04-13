# QR Menü & Ödeme SaaS Platformu — Proje Spesifikasyonu

> **Versiyon:** 1.0  
> **Tarih:** Nisan 2026  
> **Hedef:** Bu doküman, geliştirme ekibine tam ve eksiksiz bir teknik + ürün spesifikasyonu sunmak amacıyla hazırlanmıştır.

---

## 1. Genel Bakış

### 1.1 Ürün Özeti

Bu platform, her türlü yeme-içme ve hizmet işletmesinin (restoran, kafe, bar, otel, vb.) müşterilerine QR kod aracılığıyla dijital menü sunmasını, sipariş almasını ve ödeme tahsil etmesini sağlayan çok kiracılı (multi-tenant) bir SaaS web uygulamasıdır.

Müşteri akışı şu şekildedir:
1. Masadaki QR kodu telefon kamerasıyla okutulur
2. Uygulama yüklenmesine gerek kalmadan tarayıcıda dijital menü açılır
3. Müşteri ürünleri seçer, siparişini verir
4. Ödemeyi online olarak tamamlar
5. Sipariş mutfak ekranına ve garson paneline düşer

### 1.2 Hedef Kitle

- **İşletme sahipleri / yöneticiler:** Menü yönetimi, raporlama, abonelik yönetimi
- **Garsonlar:** Sipariş takibi, masa yönetimi
- **Mutfak personeli:** Gelen siparişleri görüntüleme ve durum güncelleme
- **Son kullanıcılar (müşteriler):** QR okutup sipariş veren ve ödeme yapan kişiler

### 1.3 Platform Türü

- **Web tabanlı** (PWA desteği ile mobil uyumlu)
- Müşteri arayüzü: Herhangi bir tarayıcıda çalışan, uygulama indirme gerektirmeyen responsive web sayfası
- Yönetim paneli: Masaüstü ve mobil uyumlu web arayüzü
- Mutfak ve garson ekranları: Tablet/büyük ekran optimize edilmiş web arayüzü

---

## 2. Kullanıcı Rolleri ve Yetki Matrisi

### 2.1 Roller

| Rol | Açıklama |
|---|---|
| **Super Admin** | Platform sahibi; tüm işletmeleri yönetir, abonelikleri görür |
| **İşletme Sahibi / Admin** | Kendi işletmesini yönetir; menü, masa, personel, raporlar |
| **Garson** | Sipariş takibi, masa görünümü, ödeme onayı |
| **Mutfak (KDS)** | Sadece gelen siparişleri görür ve durum günceller |
| **Müşteri** | Anonim; QR ile erişir, sipariş verir, ödeme yapar |

### 2.2 Yetki Matrisi

| Özellik | Super Admin | İşletme Admin | Garson | Mutfak | Müşteri |
|---|---|---|---|---|---|
| Menü düzenleme | ✅ | ✅ | ❌ | ❌ | ❌ |
| Sipariş görüntüleme | ✅ | ✅ | ✅ | ✅ | ❌ |
| Sipariş verme | ❌ | ❌ | ❌ | ❌ | ✅ |
| QR kod üretme | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ödeme görüntüleme | ✅ | ✅ | ✅ | ❌ | ❌ |
| Personel yönetimi | ✅ | ✅ | ❌ | ❌ | ❌ |
| Abonelik yönetimi | ✅ | ✅ | ❌ | ❌ | ❌ |
| Raporlar | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 3. Özellik Listesi (Feature Breakdown)

### 3.1 Müşteri Arayüzü (QR ile Erişilen Sayfa)

#### 3.1.1 Menü Görüntüleme
- QR kodu okutulduğunda doğrudan işletmenin menüsü açılır
- URL yapısı: `app.domain.com/{isletme-slug}/masa/{masa-no}`
- Kategoriler yatay kaydırmalı sekmeler halinde üstte gösterilir
- Ürün kartları: fotoğraf, isim, açıklama, fiyat, alerjen bilgisi, kalori (opsiyonel)
- Ürün detay sayfası: büyük fotoğraf, malzemeler, ekstra/varyant seçimleri, adet seçici
- Arama çubuğu (ürün ismi veya içerik bazlı)
- Filtre: vejeteryan, vegan, glütensiz, alkolsüz vb. etiketlere göre
- Çoklu dil desteği: müşteri dil değiştirebilir (TR, EN ve eklenen diğer diller)

#### 3.1.2 Sipariş Akışı
- Sepet: sağ alt köşede yüzen sepet butonu, ürün sayısı rozeti
- Sepet sayfası: ürün listesi, adet değiştirme, silme, özel not ekleme (ürün bazında)
- Sipariş notu: genel sipariş için de not alanı
- Siparişi Gönder butonu → onay ekranı → "Siparişiniz mutfağa iletildi" mesajı
- Aktif sipariş takibi: siparişin durumunu gerçek zamanlı görebilir (Hazırlanıyor / Yolda / Teslim Edildi)
- Ek sipariş: mevcut siparişe sonradan ürün ekleyebilme

#### 3.1.3 Ödeme Akışı
- Hesap iste butonu masaya ait tüm siparişleri listeler
- Ödeme yöntemi seçimi: Kredi/Banka Kartı, QR ile ödeme (alternatif)
- İyzico veya Stripe ödeme entegrasyonu (işletme tercihine göre)
- Bölünmüş ödeme: masadaki kişi sayısına eşit bölme veya ürün bazlı bölme
- Fiş/Makbuz: e-posta veya SMS ile gönderme seçeneği
- Bahşiş seçeneği: %10 / %15 / %20 veya özel tutar

---

### 3.2 İşletme Admin Paneli

#### 3.2.1 Dashboard
- Bugünün toplam geliri
- Aktif masa sayısı / toplam masa sayısı
- Bugün verilen sipariş sayısı
- En çok satan ürünler (top 5)
- Son siparişler akışı
- Saatlik gelir grafiği (çizgi grafik)
- Aylık gelir karşılaştırması (önceki ay vs. bu ay)

#### 3.2.2 Menü Yönetimi
- Kategori yönetimi: oluştur, düzenle, sırala (sürükle-bırak), gizle/göster
- Ürün yönetimi:
  - Ad, açıklama, fiyat, fotoğraf yükleme
  - Kategori atama
  - Stok durumu (mevcut / tükenmiş)
  - Hazırlama süresi (opsiyonel)
  - Alerjen işaretleme (14 temel alerjen)
  - Etiketler: Yeni, Önerilen, Vegan, Vejeteryan, Sıcak, Soğuk vb.
  - Kalori/makro bilgisi (opsiyonel)
- Varyant yönetimi: Boy (Küçük/Orta/Büyük), Pişirme (Az/Orta/Çok) vb.
- Ekstra yönetimi: Ekstra sos, ekstra malzeme ve fiyatları
- Toplu işlemler: çoklu ürün fiyat güncelleme, gizleme
- Sezonluk/zamanlanmış menü: belirli saatlerde aktif olan ürünler (sabah menüsü, öğle menüsü vb.)
- Çoklu dil desteği: her ürün için TR ve EN (ve diğer dil) çevirisi

#### 3.2.3 Masa Yönetimi
- Görsel masa planı: sürükle-bırak ile masa yerleşimi
- Masa ekleme/düzenleme/silme
- QR kod üretme: her masa için benzersiz QR kod
- QR kod indirme: tek tek veya toplu PDF çıktısı (baskıya hazır)
- Masa durumu görünümü: Boş / Dolu / Ödeme Bekliyor
- Bölge/Kat yönetimi: iç mekan, teras, bahçe vb.

#### 3.2.4 Sipariş Yönetimi
- Aktif siparişler listesi: masa bazlı ve kronolojik
- Sipariş detayı: ürünler, notlar, süre, tutar
- Manuel sipariş ekleme: garson panelinden sipariş girişi
- Sipariş durumu güncelleme: Bekliyor → Hazırlanıyor → Hazır → Teslim Edildi
- İptal ve iade işlemleri
- Sipariş geçmişi ve filtreleme

#### 3.2.5 Ödeme ve Muhasebe
- Günlük/haftalık/aylık gelir raporları
- Ödeme yöntemi dağılımı (nakit/kart/online)
- İşlem geçmişi ve arama
- Fatura/fiş arşivi
- CSV/Excel dışa aktarma
- İyzico ve Stripe hesap bağlama

#### 3.2.6 Personel Yönetimi
- Personel ekleme/düzenleme/silme
- Rol atama (Garson / Mutfak)
- PIN veya e-posta ile giriş seçeneği
- Vardiya takibi (opsiyonel)

#### 3.2.7 İşletme Ayarları
- İşletme adı, logo, kapak fotoğrafı
- İletişim bilgileri, adres
- Çalışma saatleri
- Para birimi seçimi
- Vergi ayarları (KDV oranı)
- Bildirim ayarları (yeni sipariş, ödeme vb.)
- Sosyal medya linkleri (menü sayfasında gösterilecek)
- Wi-Fi bilgisi (menü sayfasında gösterilecek)

---

### 3.3 Garson Paneli

- Optimize edilmiş tablet/mobil arayüz
- Aktif masaların genel görünümü (renk kodlu durum)
- Masa detayı: aktif siparişler, toplam tutar, sipariş süresi
- Sipariş durumu güncelleme
- Hesap isteme / ödeme başlatma
- Mutfaktan hazır olan siparişleri teslim alma bildirimi
- Bildirim sesi ve görsel uyarılar

---

### 3.4 Mutfak Ekranı (KDS — Kitchen Display System)

- Büyük ekrana optimize edilmiş sade arayüz
- Gelen siparişler kart görünümünde (masa no, ürünler, özel notlar, süre sayacı)
- Sıralama: geliş sırası veya öncelik
- Sipariş durumu güncelleme: Hazırlanıyor → Hazır
- Hazır olunca garson paneline otomatik bildirim
- Renk kodlu süre uyarısı: 5 dk → sarı, 10 dk → kırmızı
- Kategoriye göre filtre (içecekler / yiyecekler ayrı gösterim opsiyonu)
- Ses bildirimi: yeni sipariş geldiğinde

---

### 3.5 Super Admin Paneli (Platform Yönetimi)

- Tüm işletmelerin listesi ve detayları
- Abonelik yönetimi: plan atama, iptal, uzatma
- Gelir raporları: platform geneli
- İşletme bazlı işlem logları
- Destek talepleri yönetimi
- Duyuru / bildirim gönderme (tüm işletmelere veya belirli gruba)
- Sistem sağlığı ve hata logları

---

## 4. Abonelik Planları

| Özellik | Ücretsiz (Deneme) | Başlangıç | Profesyonel | Kurumsal |
|---|---|---|---|---|
| Masa sayısı | 5 | 20 | Sınırsız | Sınırsız |
| Menü öğesi | 30 | 100 | Sınırsız | Sınırsız |
| Dil desteği | Sadece TR | TR + EN | Çok dilli | Çok dilli |
| Online ödeme | ❌ | ✅ | ✅ | ✅ |
| KDS ekranı | ❌ | ✅ | ✅ | ✅ |
| Garson paneli | ❌ | ✅ | ✅ | ✅ |
| Analitik raporlar | Temel | Temel | Gelişmiş | Gelişmiş |
| Özel domain | ❌ | ❌ | ✅ | ✅ |
| API erişimi | ❌ | ❌ | ❌ | ✅ |
| Destek | E-posta | E-posta | Öncelikli | Özel hesap yöneticisi |
| Deneme süresi | 14 gün | — | — | — |

Fiyatlandırma: Aylık veya yıllık ödeme seçeneği (%20 yıllık indirim).

---

## 5. Teknik Gereksinimler

### 5.1 Teknoloji Stack Önerileri

> Not: Geliştirme ekibi kendi teknoloji tercihlerini kullanabilir; aşağıdaki liste yönlendirici bir öneridir.

**Frontend:**
- Framework: Next.js (React tabanlı) veya Nuxt.js (Vue tabanlı)
- UI: Tailwind CSS
- State Management: Zustand / Pinia
- Gerçek zamanlı: WebSocket veya Server-Sent Events (SSE)
- PWA desteği

**Backend:**
- Node.js (Express / Fastify) veya Laravel (PHP)
- REST API veya GraphQL
- WebSocket sunucu (Socket.io veya native)

**Veritabanı:**
- PostgreSQL (ana veritabanı)
- Redis (oturum, önbellek, gerçek zamanlı kuyruk)

**Depolama:**
- AWS S3 veya Cloudflare R2 (fotoğraf ve medya dosyaları)

**Ödeme:**
- İyzico API (Türkiye)
- Stripe API (global)

**Kimlik Doğrulama:**
- JWT tabanlı oturum yönetimi
- Refresh token desteği
- İşletme personeli için PIN girişi opsiyonu

**Altyapı:**
- Docker container desteği
- Herhangi bir cloud provider (AWS / GCP / Hetzner)
- CI/CD pipeline
- SSL zorunlu

### 5.2 Çok Kiracılı (Multi-tenant) Mimari

- Her işletme izole bir veri alanına sahip olmalı
- `tenant_id` ile tüm veritabanı kayıtları ayrıştırılır
- Subdomain veya slug bazlı yönlendirme: `{isletme-slug}.domain.com` veya `domain.com/{isletme-slug}`
- İşletme başına özel tema rengi ve logo desteği

### 5.3 Gerçek Zamanlı Gereksinimler

Aşağıdaki olaylar gerçek zamanlı (WebSocket/SSE) olarak tüm ilgili panellere iletilmelidir:

| Olay | Bildirilen Paneller |
|---|---|
| Yeni sipariş geldi | Mutfak ekranı, Garson paneli, Admin dashboard |
| Sipariş durumu değişti | Garson paneli, Müşteri sipariş takip ekranı |
| Ödeme tamamlandı | Admin dashboard, Garson paneli |
| Stok tükendi | Admin panel |
| Yeni masa açıldı | Garson paneli |

### 5.4 QR Kod Gereksinimleri

- Her masa için benzersiz, değişmeyen URL oluşturulur
- QR kod formatı: PNG ve SVG olarak indirilebilir
- Toplu QR indirme: PDF olarak (A4 sayfaya 2 veya 4 masa QR'ı)
- QR kod üzerinde işletme logosu ve masa numarası gösterilecek
- Masa QR'ı değişmez; URL yapısı kalıcıdır

### 5.5 Performans Gereksinimleri

- Müşteri menü sayfası ilk yükleme süresi: < 2 saniye (3G bağlantıda)
- API yanıt süresi: < 200ms (p95)
- Görsel optimizasyon: WebP formatı, lazy loading, CDN üzerinden servis
- Menü sayfası önbellek: statik menü verileri CDN'de önbelleklenir, değişiklikte invalidate edilir

### 5.6 Güvenlik Gereksinimleri

- HTTPS zorunlu (tüm ortamlarda)
- SQL injection koruması (parametreli sorgular)
- Rate limiting: API endpoint'lerine istek sınırı
- Ödeme verisi: PCI DSS uyumlu (kart verisi asla sistemde saklanmaz; sadece ödeme sağlayıcı token'ı tutulur)
- KVKK uyumu: Türkiye'deki kullanıcılar için veri işleme aydınlatma metni
- GDPR uyumu: AB kullanıcıları için
- Müşteri siparişi için anonim oturum: çerez tabanlı sepet, kişisel veri toplanmaz (ödeme akışına kadar)

---

## 6. Veri Modeli (Özet)

### 6.1 Ana Tablolar

**tenants** (İşletmeler)
- id, slug, name, logo_url, cover_url, plan, status
- contact_email, phone, address
- currency, tax_rate, timezone
- created_at, updated_at

**locations** (Bölgeler/Alanlar)
- id, tenant_id, name (İç Mekan, Teras vb.)

**tables** (Masalar)
- id, tenant_id, location_id, number, name, capacity, status, qr_token

**menu_categories** (Kategoriler)
- id, tenant_id, name (JSON - çok dilli), sort_order, is_active

**menu_items** (Ürünler)
- id, tenant_id, category_id, name (JSON), description (JSON)
- price, image_url, is_available, preparation_time
- calories, allergens (array), tags (array), sort_order

**item_variants** (Varyantlar)
- id, item_id, name (JSON), options (JSON array)

**item_extras** (Ekstralar)
- id, item_id, name (JSON), price, is_required

**orders** (Siparişler)
- id, tenant_id, table_id, session_token, status
- total_amount, tax_amount, tip_amount
- notes, created_at, updated_at

**order_items** (Sipariş Kalemleri)
- id, order_id, item_id, variant_id, quantity, unit_price, extras (JSON), notes, status

**payments** (Ödemeler)
- id, tenant_id, order_id, provider (iyzico/stripe)
- amount, currency, status, provider_transaction_id
- paid_at, receipt_url

**users** (Platform Kullanıcıları - Admin, Garson, Mutfak)
- id, tenant_id, name, email, password_hash, pin_hash, role
- is_active, last_login_at

**subscriptions** (Abonelikler)
- id, tenant_id, plan, status, billing_cycle
- current_period_start, current_period_end, cancelled_at

---

## 7. API Endpoint Yapısı (Özet)

### Müşteri API (Auth gerektirmez)
```
GET    /api/v1/menu/{tenant_slug}                    → Menü kategorileri ve ürünler
GET    /api/v1/menu/{tenant_slug}/items/{item_id}    → Ürün detayı
POST   /api/v1/orders/{tenant_slug}                  → Sipariş oluştur
GET    /api/v1/orders/{order_id}/status              → Sipariş durumu sorgula
POST   /api/v1/payments/{order_id}/initiate          → Ödeme başlat
POST   /api/v1/payments/{order_id}/callback          → Ödeme callback (provider'dan)
```

### Yönetim API (JWT Auth gerektirir)
```
GET/POST/PUT/DELETE  /api/v1/admin/categories
GET/POST/PUT/DELETE  /api/v1/admin/items
GET/POST/PUT/DELETE  /api/v1/admin/tables
GET/PUT              /api/v1/admin/orders
GET                  /api/v1/admin/orders/active
GET                  /api/v1/admin/reports/daily
GET                  /api/v1/admin/reports/monthly
GET/POST/DELETE      /api/v1/admin/users
GET/PUT              /api/v1/admin/settings
GET                  /api/v1/admin/qr/{table_id}
```

### Super Admin API
```
GET    /api/v1/superadmin/tenants
PUT    /api/v1/superadmin/tenants/{id}/subscription
GET    /api/v1/superadmin/reports
```

---

## 8. Kullanıcı Akış Diyagramları

### 8.1 Müşteri Sipariş Akışı

```
QR Okut
   ↓
Menü Sayfası Açılır (masa no otomatik tanınır)
   ↓
Ürün Seç → Seçenekleri Ayarla → Sepete Ekle
   ↓
Sepeti Görüntüle → Notları Ekle
   ↓
"Sipariş Ver" butonuna bas
   ↓
Onay Ekranı → Onayla
   ↓
Sipariş Mutfağa Düşer
   ↓
Sipariş Takip Ekranı (durum: Hazırlanıyor → Hazır → Teslim Edildi)
   ↓
"Hesap İste" → Tutar Görüntülenir
   ↓
Ödeme Yöntemi Seç (Kart / QR)
   ↓
Ödeme Tamamlanır → Makbuz (e-posta / SMS)
```

### 8.2 Mutfak Akışı

```
Yeni Sipariş Gelir (ses bildirimi + yeni kart)
   ↓
Sipariş Kartı: Masa No, Ürünler, Notlar, Süre Sayacı
   ↓
"Hazırlanıyor" butonuna bas (kart rengi değişir)
   ↓
Hazır olunca "Hazır" butonuna bas
   ↓
Garson paneline bildirim gider
```

### 8.3 Garson Akışı

```
Masa Görünümü → Aktif masaları izler
   ↓
Mutfaktan "Hazır" bildirimi gelir
   ↓
İlgili masaya git → Siparişi teslim et
   ↓
"Teslim Edildi" işaretle
   ↓
Müşteri hesap isterse → "Hesap Hazırla"
   ↓
Ödeme durumunu izle
```

---

## 9. Çok Dilli Destek

### 9.1 Desteklenen Diller (MVP)
- Türkçe (TR) — varsayılan
- İngilizce (EN)

### 9.2 Sonradan Eklenebilecek Diller
- Arapça (AR) — sağdan sola yazım desteği gerektirir
- Almanca (DE)
- Rusça (RU)
- Fransızca (FR)

### 9.3 Çeviri Yönetimi
- Yönetim panelinde her ürün ve kategori için TR/EN (ve diğer) metin girilebilir
- Menü sayfasında kullanıcı dil tercihini değiştirebilir
- Dil tercihi tarayıcı `localStorage`'da saklanır
- Çeviri yapılmamışsa varsayılan dil (TR) gösterilir
- Arayüz metinleri (buton, başlık, bildirim vb.) için i18n kütüphanesi kullanılır

---

## 10. Ödeme Entegrasyonu Detayları

### 10.1 İyzico

- Türkiye'deki işletmeler için birincil ödeme sağlayıcı
- 3D Secure zorunlu
- Desteklenen kartlar: Visa, Mastercard, Troy, Amex
- Taksit seçeneği (opsiyonel)
- İyzico üyelik işletme sahibi tarafından yapılır; platform, API anahtarlarını güvenli şekilde saklar
- Webhook: ödeme onay/red bildirimleri platforma iletilir

### 10.2 Stripe

- Uluslararası işletmeler için
- Desteklenen ödeme yöntemleri: Kredi/banka kartı, Apple Pay, Google Pay
- Stripe Connect kullanılır (platform komisyon modeline uygun)
- Webhook: ödeme olayları platforma iletilir

### 10.3 Ortak Ödeme Kuralları

- Kart numarası, CVV asla sistemde saklanmaz
- Tüm ödeme işlemleri sağlayıcı iframe/SDK üzerinden gerçekleşir
- Başarısız ödeme durumunda kullanıcıya açıklayıcı hata mesajı
- İade işlemi sadece admin panelinden yapılabilir

---

## 11. Bildirim Sistemi

### 11.1 Anlık (In-App) Bildirimler

WebSocket üzerinden gerçek zamanlı bildirimler:
- Yeni sipariş → Mutfak + Garson
- Sipariş durumu değişti → Müşteri sipariş takip
- Hesap istendi → Garson
- Ödeme tamamlandı → Admin dashboard

### 11.2 E-posta Bildirimleri

- Yeni kayıt / onay e-postası (işletme için)
- Abonelik yenileme / ödeme başarısız
- Günlük özet raporu (opsiyonel, admin ayarından açılabilir)
- Müşteri ödeme makbuzu

### 11.3 SMS Bildirimleri

- Müşteri ödeme makbuzu (opsiyonel)
- İşletme için kritik uyarılar (opsiyonel, premium plan)

---

## 12. Raporlama ve Analitik

### 12.1 İşletme Admin Raporları

- **Gelir Raporu:** günlük, haftalık, aylık, yıllık
- **Sipariş Raporu:** sipariş sayısı, ortalama sepet tutarı, iptal oranı
- **Ürün Performansı:** en çok/az satılan ürünler, kategori bazlı dağılım
- **Yoğunluk Analizi:** saatlik/günlük sipariş yoğunluk grafiği
- **Masa Kullanımı:** masa doluluk oranı, ortalama masa süresi
- **Ödeme Yöntemi Dağılımı:** nakit / kart / online

### 12.2 Dışa Aktarma

- Tüm raporlar CSV ve Excel olarak indirilebilir
- Tarih aralığı seçimi
- İsteğe bağlı sütun seçimi

---

## 13. Tema ve Özelleştirme

### 13.1 İşletme Başına Özelleştirme

- Logo yükleme (menü sayfasında gösterilir)
- Kapak fotoğrafı
- Ana renk seçimi (marka rengi; butonlar ve aksan renkleri)
- Sosyal medya linkleri
- Wi-Fi bilgisi

### 13.2 Menü Sayfası Görünümü

- Açık/koyu tema seçeneği (müşteri tarayıcı tercihine göre otomatik)
- Izgara (grid) veya liste (list) görünüm seçeneği

---

## 14. Kısıtlamalar ve Kapsam Dışı (V1 için)

Aşağıdaki özellikler ilk versiyon kapsamı dışındadır; ilerleyen versiyonlarda eklenebilir:

- Mobil native uygulama (iOS / Android)
- Sadakat programı / puan sistemi
- Rezervasyon sistemi
- Stok yönetimi (ürün bazında stok takibi)
- Muhasebe entegrasyonu (e-fatura, Logo, SAP vb.)
- Paket servis / gel-al siparişi
- QR dışı sipariş (masa üstü tablet)
- Çoklu şube yönetimi (tek admin altında birden fazla işletme lokasyonu) — V2
- Açık API / webhook desteği — Kurumsal plan V2

---

## 15. Başarı Kriterleri (KPIs)

- Menü sayfası yükleme süresi: < 2 sn (3G)
- Sipariş oluşturma başarı oranı: > %99
- Ödeme başarı oranı: > %95
- Sistem uptime: > %99.9
- Ortalama müşteri sipariş tamamlama süresi: < 3 dakika

---

## 16. Ekler

### 16.1 Sözlük

| Terim | Açıklama |
|---|---|
| Tenant | Platforma kayıtlı işletme |
| KDS | Kitchen Display System — Mutfak görüntüleme ekranı |
| QR Token | Masaya özgü benzersiz tanımlayıcı |
| Session Token | Müşterinin anonim oturumu için tarayıcı çerezi |
| Slug | URL'de kullanılan kısa işletme adı (örn. `cafe-istanbul`) |
| PWA | Progressive Web App — Uygulama gibi çalışan web sitesi |

### 16.2 Teknik Notlar

- Müşteri sepeti, sunucu tarafında sipariş oluşturulana kadar yalnızca tarayıcıda (localStorage/sessionStorage) tutulur. Sunucuya yalnızca sipariş "gönder" butonuna basıldığında yazılır.
- QR token ile masa bilgisi eşleştirilir; token'ın değişmemesi gerekir. Masa silinirse yeni token üretilir.
- İyzico ve Stripe eş zamanlı kullanılabilir; işletme admin panelinden hangisini etkinleştireceğini seçer.
- Çok dilli menü verisi JSON sütununda saklanır: `{"tr": "Americano", "en": "Americano", "de": "Americano"}`

---

*Bu doküman, geliştirme sürecinde güncellenebilir. Değişiklikler versiyon numarası ile takip edilmelidir.*
