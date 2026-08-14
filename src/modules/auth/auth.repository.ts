import {prisma} from '../../config/prisma.js'

export const authRepository = {
  findUserByemail: (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },
  creatUser: (data: { name: string; email: string; password_hash: string }) => {
    return prisma.user.create({ data });
  },
};