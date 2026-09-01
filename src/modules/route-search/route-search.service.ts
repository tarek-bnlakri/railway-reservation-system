import { routeSearchRepository } from './route-search.repository.js';
import { buildGraph } from './graph.builder.js';
import { dijkstra } from './dijkstra.js';
export const routeSearchService = {
  findCheapestPath: async (sourceId: string, destinationId: string) => {
    const routes = await routeSearchRepository.getAllRoutes();
    const graph = buildGraph(routes);
    const result = dijkstra(graph, sourceId, destinationId);

    if (!result) {
      throw new Error('NO_ROUTE_FOUND');
    }
    return result;
  },
};