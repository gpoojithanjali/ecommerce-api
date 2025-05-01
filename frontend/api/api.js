import axios from 'axios';

// Dynamic backend API base URL from environment variable
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// FakeStore API
const FAKE_STORE_API = 'https://fakestoreapi.com';

export const api = {
  // ===== ORDER MANAGEMENT =====
  getRecentOrders: () => axios.get(`${API_BASE}/api/orders/recent`),
  getOrderSummary: () => axios.get(`${API_BASE}/api/orders/summary`),
  getOrderDetails: (id) => axios.get(`${API_BASE}/api/orders/${id}`),
  createOrder: (data) => axios.post(`${API_BASE}/api/orders`, data),
  updateOrder: (id, data) => axios.put(`${API_BASE}/api/orders/${id}`, data),
  deleteOrder: (id) => axios.delete(`${API_BASE}/api/orders/${id}`),
  getTracking: (id) => axios.get(`${API_BASE}/api/orders/${id}/tracking`),

  // Customers
  getCustomerOrders: (id) => axios.get(`${API_BASE}/api/customers/${id}/orders`),
  getRecommendations: (id) => axios.get(`${API_BASE}/api/customers/${id}/recommendations`),

  // ===== E-COMMERCE PRODUCTS =====
  getElectronics: () => axios.get(`${FAKE_STORE_API}/products/category/electronics`),
  getProduct: (id) => axios.get(`${FAKE_STORE_API}/products/${id}`),
  // Optional endpoints:
  // getProducts: () => axios.get(`${FAKE_STORE_API}/products`),
  // getCategories: () => axios.get(`${FAKE_STORE_API}/products/categories`),
  // getCategoryProducts: (category) => axios.get(`${FAKE_STORE_API}/products/category/${category}`)
};

// Optional: Axios instance with default settings (not used above)
const apiInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiInstance;
