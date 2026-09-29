import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiSearchService } from '../src/modules/ai-search/ai-search.service';
import { nlParcerService } from '../src/modules/ai-search/nl-parcer.service';
import { resolveStationByName } from '../src/modules/ai-search/station-resolver';
import { routeSearchService } from '../src/modules/route-search/route-search.service';

vi.mock('../src/modules/ai-search/nl-parcer.service', () => ({
  nlParcerService: {
    parseTripQuery: vi.fn(),
  },
}));

vi.mock('../src/modules/ai-search/station-resolver', () => ({
  resolveStationByName: vi.fn(), 
}));

vi.mock('../src/modules/route-search/route-search.service', () => ({
  routeSearchService: {
    findCheapestPath: vi.fn(),
  },
}));


describe('aiSearchService.searchFromNaturalLanguage', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return needsClarification if AI fails to extract source or destination', async () => {
    vi.mocked(nlParcerService.parseTripQuery).mockResolvedValue({
      source: null,
      destination: 'Paris',
      date: null,
    });

    const result = await aiSearchService.searchFromNaturalLanguage('go to Paris');

    expect(result?.needsClarification).toBe(true);
    expect(result?.message).toContain('Could you specify both departure and destination');
    
    expect(resolveStationByName).not.toHaveBeenCalled();
    expect(routeSearchService.findCheapestPath).not.toHaveBeenCalled();
  });


  it('should return needsClarification if the database cannot find the station', async () => {
    vi.mocked(nlParcerService.parseTripQuery).mockResolvedValue({
      source: 'Hogwarts',
      destination: 'Paris',
      date: null,
      intent: 'search'
    });

    vi.mocked(resolveStationByName).mockImplementation(async (name) => {
      if (name === 'Hogwarts') return null; 
      if (name === 'Paris') return { id: '456', name: 'Paris', code: 'PAR', location: 'France' } as never;
      return null;
    });

    const result = await aiSearchService.searchFromNaturalLanguage('go from Hogwarts to Paris', 'user-1');

    expect(result?.needsClarification).toBe(true);
    expect(result?.message).toContain("Couldn't find a matching station");
    
    expect(routeSearchService.findCheapestPath).not.toHaveBeenCalled();
  });


  it('should return the route results when everything works perfectly', async () => {
    vi.mocked(nlParcerService.parseTripQuery).mockResolvedValue({
      source: 'London',
      destination: 'Paris',
      date: null,
      intent: 'search'
    });

    vi.mocked(resolveStationByName).mockImplementation(async (name) => {
      if (name === 'London') return { id: 'station-1', name: 'London', code: 'LON', location: 'UK' } as never;
      if (name === 'Paris') return { id: 'station-2', name: 'Paris', code: 'PAR', location: 'France' } as never;
      return null;
    });

    vi.mocked(routeSearchService.findCheapestPath).mockResolvedValue({
      path: [{stationId: 'station-1', routeId: null}, {stationId: 'station-2', routeId: 'route-1'}],
      totalPrice: 45.00,
    } as never);

    const result = await aiSearchService.searchFromNaturalLanguage('from London to Paris', 'user-1');

    expect(result?.needsClarification).toBe(false);
  });
});