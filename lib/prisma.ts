// Database adapter boundary. Run `npx prisma generate` after configuring DATABASE_URL.
// Kept intentionally lazy so the public UI can build without a database connection.
export const prisma = null as unknown as { [key: string]: unknown };
