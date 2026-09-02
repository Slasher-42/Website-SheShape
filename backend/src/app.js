import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middleware/error.js'

const app = express()

app.use(morgan('dev'))
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app
