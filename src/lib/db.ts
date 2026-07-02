/**
 * Database client (lazy, optional).
 *
 * STRIKR currently uses in-memory data from `football-data.ts`,
 * so the Prisma client is only initialized when actually needed.
 * This avoids breaking on serverless platforms (Vercel) where
 * SQLite/file-based DBs aren't persistent.
 *
 * To enable Prisma on Vercel, switch the datasource in `prisma/schema.prisma`
 * to "postgresql" and set `DATABASE_URL` in Vercel env vars.
 */

let dbInstance: unknown = null;

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!dbInstance) {
        // Lazy-load only when DB is actually accessed
        throw new Error(
          `[STRIKR] Database access attempted but Prisma is not configured. ` +
            `Set DATABASE_URL and ensure prisma generate has run. ` +
            `Property accessed: ${String(prop)}`,
        );
      }
      return Reflect.get(dbInstance as object, prop);
    },
  },
);
