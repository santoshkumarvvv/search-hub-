// Lazy Prisma client singleton; avoids requiring generated artifacts during static builds.
let client: any;
function getClient(){ if(!client){ const {PrismaClient}=require('@prisma/client'); client=new PrismaClient(); } return client; }
export const prisma = new Proxy({}, { get: (_target, property) => getClient()[property] }) as any;
