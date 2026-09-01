import { describe, it, expect } from 'vitest';
import { buildGraph } from '../src/modules/route-search/graph.builder';
import { dijkstra } from '../src/modules/route-search/dijkstra';

describe('dijkstra', () => {
  it('picks the cheaper multi-hop path over a pricier direct route', () => {
    const routes = [
      { id: 'r1', source_id: 'WAW', destination_id: 'KRK', base_price: 120 },
      { id: 'r2', source_id: 'GDN', destination_id: 'WAW', base_price: 130 },
      { id: 'r3', source_id: 'GDN', destination_id: 'KRK', base_price: 350 },
      
    ];
    const graph = buildGraph(routes);
    const result = dijkstra(graph, 'GDN', 'KRK');

    expect(result?.totalPrice).toBe(250); 
    expect(result?.path.map(p => p.stationId)).toEqual(['GDN', 'WAW', 'KRK']);
  });
});