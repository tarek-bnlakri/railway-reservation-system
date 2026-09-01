import { prisma } from "../../config/prisma.js";

export const routeSearchRepository={
    getAllRoutes:()=>prisma.route.findMany()
}