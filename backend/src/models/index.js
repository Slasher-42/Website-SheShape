import { sequelize } from '../db.js'
import User from './User.js'
import { Product, PRODUCT_CATEGORIES } from './Product.js'
import { ProductImage } from './ProductImage.js'
import Order, { ORDER_STATUSES } from './Order.js'
import OrderItem from './OrderItem.js'
import Post from './Post.js'
import Program, { PROGRAM_STATUSES } from './Program.js'

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

User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' })
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author', onDelete: 'SET NULL' })

export {
  sequelize,
  User,
  Product,
  ProductImage,
  Order,
  OrderItem,
  Post,
  Program,
  PRODUCT_CATEGORIES,
  ORDER_STATUSES,
  PROGRAM_STATUSES
}
