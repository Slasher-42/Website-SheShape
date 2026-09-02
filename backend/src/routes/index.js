import { Router } from 'express'
import { sequelize } from '../db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import productRoutes from './products.routes.js'

const router = Router()

router.get('/health', asyncHandler(async (req, res) => {
  await sequelize.authenticate()
  res.json({
    status: 'ok',
    database: 'connected',
    timestamp: new Date().toISOString()
  })
}))

router.use('/products', productRoutes)

export default router
