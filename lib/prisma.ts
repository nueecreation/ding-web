import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure PgBouncer transaction-mode params are always present.
// "prepared statement already exists" occurs when the pooler reuses a
// connection that still holds a named prepared statement. pgbouncer=true
// makes Prisma use the simple query protocol (no prepared statements).
function getDbUrl() {
  const raw = process.env.DATABASE_URL ?? "";
  try {
    const u = new URL(raw);
    if (!u.searchParams.has("pgbouncer")) u.searchParams.set("pgbouncer", "true");
    if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "1");
    if (!u.searchParams.has("statement_cache_size")) u.searchParams.set("statement_cache_size", "0");
    return u.toString();
  } catch {
    return raw;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: { db: { url: getDbUrl() } },
  });

globalForPrisma.prisma = prisma;
