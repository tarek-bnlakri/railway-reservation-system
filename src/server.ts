import express from 'express'
import authRoutes from './modules/auth/auth.routes.js'
import tripsRouter from './modules/trips/trips.routes.js'
import bookingRouter from './modules/bookings/bookings.routes.js'
const app = express();

app.use(express.json());
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/trips',tripsRouter)
app.use('/api/v1/bookings',bookingRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>console.log(`Server running on PORT ${PORT}`))

