import { sequelize } from '../db.js'
import User from './User.js'
import { Product, PRODUCT_CATEGORIES } from './Product.js'
import { ProductImage } from './ProductImage.js'
import Order, { ORDER_STATUSES } from './Order.js'
import OrderItem from './OrderItem.js'

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

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product', onDelete: 'SET NULL' });

export {
  sequelize,
  User,
  Product,
  ProductImage,
  Order,
  OrderItem,
  PRODUCT_CATEGORIES,
  ORDER_STATUSES
}
