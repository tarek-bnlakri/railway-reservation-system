import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService  } from '../src/modules/bookings/bookings.service.js';
import { BookingRepository } from '../src/modules/bookings/bookings.repository.js';

vi.mock('../src/modules/bookings/bookings.repository.js', () => ({
  BookingRepository: {
    createBookingWithLock: vi.fn(),
  },
}));

describe('BookingsService.createBooking', () => {
  beforeEach(() => {
    vi.clearAllMocks(); 
  });

  it('calls the repository with correct params and returns the booking', async () => {
    const fakeBooking = { id: 'booking-1', status: 'PENDING' };
    
    
    vi.mocked(BookingRepository.createBookingWithLock).mockResolvedValue(
      fakeBooking as never
    );

    const result = await BookingService .createBooking('user-1', 'seat-1', 'trip-1');

    expect(BookingRepository.createBookingWithLock).toHaveBeenCalledWith('user-1', 'seat-1', 'trip-1');
    expect(result).toEqual(fakeBooking);
  });

  it('propagates errors from the repository (e.g. seat already booked)', async () => {
    
    vi.mocked(BookingRepository.createBookingWithLock).mockRejectedValue(
      new Error('SEAT_ALREADY_BOOKED')
    );

    await expect(
      BookingService .createBooking('user-1', 'seat-1', 'trip-1')
    ).rejects.toThrow('SEAT_ALREADY_BOOKED');
  });
});