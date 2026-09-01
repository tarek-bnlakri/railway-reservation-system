import type { Prisma } from "@prisma/client";

type RouteEdge = { destinationId: string; weight: number; routeId: string };
export type Graph = Map<string, RouteEdge[]>;

export function buildGraph(routes: { id: string; source_id: string; destination_id: string; base_price: Prisma.Decimal }[]): Graph {
  const graph: Graph = new Map();

  for (const route of routes) {
    if (!graph.has(route.source_id)) graph.set(route.source_id, []);
    graph.get(route.source_id)!.push({
      destinationId: route.destination_id,
      weight: Number(route.base_price),
      routeId: route.id,
    });
  }

  return graph;
}