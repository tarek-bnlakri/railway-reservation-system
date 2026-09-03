import express from 'express'
import authRoutes from './modules/auth/auth.routes.js'
import tripsRouter from './modules/trips/trips.routes.js'
import bookingRouter from './modules/bookings/bookings.routes.js'
import routeSearchRoutes from './modules/route-search/route-search.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import { startBookingExpiryLisitner } from './modules/bookings/booking-expiry.listener.js';
const app = express();

app.use(express.json());
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/trips',tripsRouter)
app.use('/api/v1/bookings',bookingRouter)
app.use('/api/v1/route-search', routeSearchRoutes);
app.use('/api/v1/payments', paymentsRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>console.log(`Server running on PORT ${PORT}`))
startBookingExpiryLisitner();

