import { sequelize } from '../db.js'
import { Product, PRODUCT_CATEGORIES } from './Product.js'
import { ProductImage } from './ProductImage.js'

Product.hasMany(ProductImage, {
  as: 'images',
  foreignKey: { name: 'productId', allowNull: false },
  onDelete: 'CASCADE',
  hooks: true
})

ProductImage.belongsTo(Product, {
  as: 'product',
  foreignKey: { name: 'productId', allowNull: false }
})

export { sequelize, Product, ProductImage, PRODUCT_CATEGORIES }
