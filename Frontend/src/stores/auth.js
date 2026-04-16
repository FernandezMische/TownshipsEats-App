import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)
  const isAuthenticated = ref(!!token.value)

  // Getters
  const getUser = computed(() => user.value)
  const getToken = computed(() => token.value)
  const getRole = computed(() => user.value?.role || null)
  const isLoggedIn = computed(() => isAuthenticated.value)

  // Actions
  function setAuthData(userData, authToken) {
    user.value = userData
    token.value = authToken
    isAuthenticated.value = true
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', authToken)
    
    // Set default axios header
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  function clearAuthData() {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    // Remove axios header
    delete axios.defaults.headers.common['Authorization']
  }

  async function login(credentials) {
    try {
      const response = await axios.post('https://townships-eats-backend.onrender.com/api/auth/login', credentials)
      
      if (response.data.success) {
        const { data } = response.data
        setAuthData(data, data.token)
        return { success: true, data }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  async function register(userData) {
    try {
      const response = await axios.post('http://localhost:5401/api/auth/register', userData)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      }
    }
  }

  function logout() {
    clearAuthData()
    window.location.href = '/login'
  }

  return { 
    user, token, isAuthenticated,
    getUser, getToken, getRole, isLoggedIn,
    login, register, logout, setAuthData, clearAuthData
  }
})
