import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
/*global process*/
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(cookieParser())


//routes import 
import mediaRoutes from './routes/mediaRoutes.js';

// routes declaration
app.use('/api/media', mediaRoutes);


export { app };