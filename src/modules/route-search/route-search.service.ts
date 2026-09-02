import { routeSearchRepository } from './route-search.repository.js';
import { buildGraph } from './graph.builder.js';
import { dijkstra } from './dijkstra.js';
import {redis} from "../../config/redis.js"

export const routeSearchService = {
  findCheapestPath: async (sourceId: string, destinationId: string) => {
    const cacheKey = `route-search:${sourceId}:${destinationId}`
    
    const cashed = await redis.get(cacheKey) 
    if (cashed){
      console.log("Cash Hit",cacheKey)
      return JSON.parse(cashed)

    }
        console.log('Cache MISS:', cacheKey);

    const routes = await routeSearchRepository.getAllRoutes();
    const graph = buildGraph(routes);
    const result = dijkstra(graph, sourceId, destinationId);

    if (!result) {
      throw new Error('NO_ROUTE_FOUND');
    }
    await redis.set(cacheKey,JSON.stringify(result),"EX",300)
    return result;
  },
};