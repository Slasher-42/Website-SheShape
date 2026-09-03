import api from './client.js'

const unwrap = (response) => response.data.data

export const adminProducts = {
  list: (params) => api.get('/admin/products', { params }).then((r) => r.data),
  detail: (id) => api.get(`/admin/products/${id}`).then(unwrap),
  create: (payload) => api.post('/admin/products', payload).then(unwrap),
  update: (id, payload) => api.patch(`/admin/products/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/admin/products/${id}`),
  attachImage: (id, url) => api.post(`/admin/products/${id}/images`, { url }).then(unwrap),
  detachImage: (id, imageId) => api.delete(`/admin/products/${id}/images/${imageId}`),
  reorderImages: (id, ids) =>
    api.patch(`/admin/products/${id}/images/order`, { ids }).then(unwrap)
}

export const adminOrders = {
  list: (params) => api.get('/admin/orders', { params }).then((r) => r.data),
  counts: () => api.get('/admin/orders/counts').then(unwrap),
  detail: (id) => api.get(`/admin/orders/${id}`).then(unwrap),
  updateStatus: (id, status) =>
    api.patch(`/admin/orders/${id}/status`, { status }).then(unwrap)
}

export const adminUploads = {
  presign: (payload) => api.post('/admin/uploads/presign', payload).then(unwrap)
}
