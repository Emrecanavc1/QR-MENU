import { PrismaClient, UserRole, SubscriptionPlan, TenantStatus, SubscriptionStatus, BillingCycle } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed başlatılıyor...");

  // Super Admin oluştur
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? "superadmin@qrmenu.com";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? "Admin123!";

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const passwordHash = await bcrypt.hash(superAdminPassword, 12);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: superAdminEmail,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        tenantId: null,
      },
    });
    console.log(`✅ Super Admin oluşturuldu: ${superAdminEmail}`);
  } else {
    console.log(`ℹ️  Super Admin zaten mevcut: ${superAdminEmail}`);
  }

  // Demo işletme oluştur
  const demoSlug = "demo-restoran";
  const existingTenant = await prisma.tenant.findUnique({ where: { slug: demoSlug } });

  if (!existingTenant) {
    const tenant = await prisma.tenant.create({
      data: {
        slug: demoSlug,
        name: "Demo Restoran",
        contactEmail: "admin@demo-restoran.com",
        plan: SubscriptionPlan.PROFESSIONAL,
        status: TenantStatus.ACTIVE,
        currency: "TRY",
        taxRate: 8,
        primaryColor: "#f97316",
      },
    });

    // Abonelik oluştur
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        plan: SubscriptionPlan.PROFESSIONAL,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      },
    });

    // Admin kullanıcı
    const adminPasswordHash = await bcrypt.hash("Demo123!", 12);
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: "Demo Admin",
        email: "admin@demo-restoran.com",
        passwordHash: adminPasswordHash,
        role: UserRole.BUSINESS_ADMIN,
      },
    });

    // Garson kullanıcı
    const waiterPinHash = await bcrypt.hash("1234", 12);
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: "Ali Garson",
        email: "garson@demo-restoran.com",
        passwordHash: await bcrypt.hash("Garson123!", 12),
        pinHash: waiterPinHash,
        role: UserRole.WAITER,
      },
    });

    // Mutfak kullanıcı
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: "Mutfak Ekranı",
        email: "mutfak@demo-restoran.com",
        passwordHash: await bcrypt.hash("Mutfak123!", 12),
        pinHash: await bcrypt.hash("5678", 12),
        role: UserRole.KITCHEN,
      },
    });

    // Bölge oluştur
    const icMekan = await prisma.location.create({
      data: { tenantId: tenant.id, name: "İç Mekan", sortOrder: 0 },
    });
    const teras = await prisma.location.create({
      data: { tenantId: tenant.id, name: "Teras", sortOrder: 1 },
    });

    // Masalar oluştur
    for (let i = 1; i <= 5; i++) {
      await prisma.table.create({
        data: {
          tenantId: tenant.id,
          locationId: icMekan.id,
          number: i,
          name: `Masa ${i}`,
          capacity: 4,
          posX: (i - 1) * 120,
          posY: 0,
        },
      });
    }
    for (let i = 6; i <= 8; i++) {
      await prisma.table.create({
        data: {
          tenantId: tenant.id,
          locationId: teras.id,
          number: i,
          name: `Teras ${i}`,
          capacity: 6,
          posX: (i - 6) * 140,
          posY: 0,
        },
      });
    }

    // Menü kategorileri
    const sicakIcecekler = await prisma.menuCategory.create({
      data: {
        tenantId: tenant.id,
        name: { tr: "Sıcak İçecekler", en: "Hot Beverages" },
        sortOrder: 0,
      },
    });
    const sogukIcecekler = await prisma.menuCategory.create({
      data: {
        tenantId: tenant.id,
        name: { tr: "Soğuk İçecekler", en: "Cold Beverages" },
        sortOrder: 1,
      },
    });
    const kahvalti = await prisma.menuCategory.create({
      data: {
        tenantId: tenant.id,
        name: { tr: "Kahvaltı", en: "Breakfast" },
        sortOrder: 2,
        availableFrom: "08:00",
        availableTo: "11:30",
      },
    });
    const anaYemekler = await prisma.menuCategory.create({
      data: {
        tenantId: tenant.id,
        name: { tr: "Ana Yemekler", en: "Main Dishes" },
        sortOrder: 3,
      },
    });

    // Menü ürünleri
    await prisma.menuItem.createMany({
      data: [
        {
          tenantId: tenant.id,
          categoryId: sicakIcecekler.id,
          name: { tr: "Türk Kahvesi", en: "Turkish Coffee" },
          description: { tr: "Geleneksel Türk kahvesi", en: "Traditional Turkish coffee" },
          price: 45,
          tags: ["HOT"],
          sortOrder: 0,
        },
        {
          tenantId: tenant.id,
          categoryId: sicakIcecekler.id,
          name: { tr: "Americano", en: "Americano" },
          description: { tr: "Espresso + sıcak su", en: "Espresso + hot water" },
          price: 55,
          tags: ["HOT"],
          sortOrder: 1,
        },
        {
          tenantId: tenant.id,
          categoryId: sicakIcecekler.id,
          name: { tr: "Cappuccino", en: "Cappuccino" },
          description: { tr: "Espresso + buharla ısıtılmış süt köpüğü", en: "Espresso + steamed milk foam" },
          price: 65,
          tags: ["HOT"],
          allergens: ["MILK"],
          sortOrder: 2,
        },
        {
          tenantId: tenant.id,
          categoryId: sogukIcecekler.id,
          name: { tr: "Soğuk Kahve", en: "Iced Coffee" },
          description: { tr: "Buzlu espresso + süt", en: "Iced espresso + milk" },
          price: 70,
          tags: ["COLD", "RECOMMENDED"],
          allergens: ["MILK"],
          sortOrder: 0,
        },
        {
          tenantId: tenant.id,
          categoryId: sogukIcecekler.id,
          name: { tr: "Limonata", en: "Lemonade" },
          description: { tr: "Taze sıkılmış limon suyu", en: "Freshly squeezed lemon juice" },
          price: 50,
          tags: ["COLD", "VEGAN"],
          sortOrder: 1,
        },
        {
          tenantId: tenant.id,
          categoryId: anaYemekler.id,
          name: { tr: "Izgara Köfte", en: "Grilled Meatballs" },
          description: { tr: "Yanında pilav ve salata ile", en: "Served with rice and salad" },
          price: 180,
          preparationTime: 20,
          calories: 520,
          tags: ["HOT"],
          allergens: ["GLUTEN"],
          sortOrder: 0,
        },
        {
          tenantId: tenant.id,
          categoryId: anaYemekler.id,
          name: { tr: "Tavuk Şiş", en: "Chicken Skewer" },
          description: { tr: "Marine edilmiş tavuk göğsü", en: "Marinated chicken breast" },
          price: 165,
          preparationTime: 15,
          calories: 420,
          tags: ["HOT"],
          sortOrder: 1,
        },
        {
          tenantId: tenant.id,
          categoryId: kahvalti.id,
          name: { tr: "Serpme Kahvaltı", en: "Full Breakfast Spread" },
          description: { tr: "Peynir çeşitleri, zeytin, yumurta ve daha fazlası", en: "Assorted cheeses, olives, eggs and more" },
          price: 250,
          preparationTime: 15,
          calories: 800,
          tags: ["RECOMMENDED"],
          allergens: ["MILK", "EGGS", "GLUTEN"],
          sortOrder: 0,
        },
      ],
    });

    console.log(`✅ Demo işletme oluşturuldu: ${demoSlug}`);
    console.log("   📧 Admin: admin@demo-restoran.com / Demo123!");
    console.log("   👨‍🍳 Mutfak PIN: 5678");
    console.log("   🧑‍💼 Garson PIN: 1234");
  } else {
    console.log(`ℹ️  Demo işletme zaten mevcut: ${demoSlug}`);
  }

  console.log("✅ Seed tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
