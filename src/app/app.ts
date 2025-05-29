import express from 'express'
import router from '../routes/route'
import dotenv from 'dotenv'
import cors from 'cors'
import CookieParser from 'cookie-parser'
import path from 'path'
import { JOUError } from '../lib/error'

dotenv.config()
const app = express()

declare global {
    namespace Express {
        interface Request {
            user: {
                id: string,
                name: string,
                userType: 'youtuber' | 'editor',
            };
        }
    }
}

// Apply Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(CookieParser())
app.use(express.static(path.resolve('public')));

// Set Routee
app.use('/', router)

// Converting Error into Response
app.use((err: JOUError, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Server Error'

    res.status(statusCode).json({ message })
})

export default app