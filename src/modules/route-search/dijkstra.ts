import { MinHeap } from "../../shared/data-structures/min-heap.js";
import type {Graph} from './graph.builder.js'


export function dijkstra(graph:Graph, source_id:string, destenation_id:string){

    const distances = new Map<string, number>()
    const previous  = new Map<string, {nodeId:string,routeId:string}>()
    const visited   = new Set<string>()
    const heap      = new MinHeap<string>()

    distances.set(source_id,0)
    heap.insert(source_id,0)

    while(!heap.isEmpty()){
        const current = heap.extractMin();
        const currentId = current!.value;

        if (visited.has(currentId)) continue;
        visited.add(currentId)

        if (currentId === destenation_id)
            break

        const neighbors = graph.get(currentId) || []

        for( const edge of neighbors){
            const totalDist = (distances.get(currentId) ?? Infinity) +edge.weight
             if (totalDist < (distances.get(edge.destinationId)?? Infinity)){
                distances.set(edge.destinationId,totalDist)
                previous.set(edge.destinationId,{nodeId:currentId,routeId:edge.routeId})
                heap.insert(edge.destinationId,totalDist)
            }
       

        }
    }
    if (!distances.has(destenation_id))
            return null;

 const path: { stationId: string; routeId: string | null }[] = [];
  let current = destenation_id;
  
  while (current !== source_id) {
    const prev = previous.get(current);
    
    if (!prev) break;
    path.unshift({ stationId: current, routeId: prev.routeId });
    current = prev.nodeId;
  }

  path.unshift({ stationId: source_id, routeId: null });

  return { totalPrice: distances.get(destenation_id), path };
}