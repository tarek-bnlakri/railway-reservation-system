import { BookingRepository } from "./bookings.repository.js"

export const BookingService={
    createBooking:async(userId:string,seatId:string,tripId:string)=>{
        return BookingRepository.createBookingWithLock(userId,seatId,tripId)

    }
}