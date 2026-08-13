import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env["DATABASE_URL"],
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const authRepository = {
  findUserByemail: (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },
  creatUser: (data: { name: string; email: string; password_hash: string }) => {
    return prisma.user.create({ data });
  },
};