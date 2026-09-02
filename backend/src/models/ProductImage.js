import { DataTypes } from 'sequelize'
import { sequelize } from '../db.js'

export const ProductImage = sequelize.define('product_images', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { isUrl: true }
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  indexes: [{ fields: ['product_id', 'sort_order'] }]
})
