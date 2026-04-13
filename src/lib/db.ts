import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Multi-tenant izolasyonu sağlayan özel Prisma Client.
 * Tüm sorgularda (find, update, delete vb.) otomatik olarak `tenantId` filtresi uygular.
 */
export function getTenantDb(tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: {
          model: string;
          operation: string;
          args: Record<string, unknown>;
          query: (args: Record<string, unknown>) => Promise<unknown>;
        }) {
          // tenantId içermeyen veya özel yönetilmesi gereken tabloları burada atlıyoruz
          const ignoreModels = ["Tenant", "User", "Subscription"];

          if (!ignoreModels.includes(model as string)) {
            // findUnique operasyonları için tenantId ekle
            // (User.email gibi global unique fields için ignore)
            if (operation === "findUnique") {
              // @ts-ignore
              args.where = { ...(args.where || {}), tenantId };
            }

            // findMany, findFirst vb. operasyonlar için WHERE koşuluna tenantId ekle
            if (["findMany", "findFirst", "update", "updateMany", "delete", "deleteMany", "count", "aggregate", "groupBy"].includes(operation)) {
              // @ts-ignore - Prisma dynamic args interface is complex
              args.where = { ...(args.where || {}), tenantId };
            }

            // Create işlemleri için DATA içerisine tenantId enjekte et
            if (["create", "createMany"].includes(operation)) {
               // @ts-ignore
              if (Array.isArray(args.data)) {
                // @ts-ignore
                args.data = args.data.map(d => ({ ...d, tenantId }));
              } else if (args.data) {
                // @ts-ignore
                args.data.tenantId = tenantId;
              }
            }

            // Upsert işlemi için hem where hem create'e eklenecek
            if (operation === "upsert") {
              // @ts-ignore
              args.where = { ...(args.where || {}), tenantId };
              // @ts-ignore
              if (args.create) args.create.tenantId = tenantId;
            }
          }

          return query(args);
        },
      },
    },
  });
}
