import express from 'express'
import authRoutes from './modules/auth/auth.routes.js'

const app = express();

app.use(express.json());
app.use('/api/v1/auth',authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>console.log(`Server runing on PORT ${PORT}`))

