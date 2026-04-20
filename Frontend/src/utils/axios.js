import axios from 'axios'

// Create axios instance with base URL from env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://townships-eats-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
