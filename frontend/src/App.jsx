import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import AdminProductsPage from './pages/admin/Products.jsx'
import AdminProductFormPage from './pages/admin/ProductForm.jsx'
import AdminOrdersPage from './pages/admin/Orders.jsx'
import AdminOrderDetailPage from './pages/admin/OrderDetail.jsx'
import AdminPostsPage from './pages/admin/Posts.jsx'
import AdminPostEditorPage from './pages/admin/PostEditor.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderConfirm from './pages/OrderConfirm.jsx'
import MyOrders from './pages/MyOrders.jsx'
import ProgramsPage from './pages/Programs.jsx'
import ProgramPage from './pages/Program.jsx'
import BlogPage from './pages/Blog.jsx'
import PostPage from './pages/Post.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:orderNumber" element={<OrderConfirm />} />
        <Route element={<ProtectedRoute />}>
          <Route path="my-orders" element={<MyOrders />} />
        </Route>
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:slug" element={<ProgramPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<PostPage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id" element={<AdminProductFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="posts" element={<AdminPostsPage />} />
        <Route path="posts/new" element={<AdminPostEditorPage />} />
        <Route path="posts/:id" element={<AdminPostEditorPage />} />
      </Route>
    </Routes>
  )
}
