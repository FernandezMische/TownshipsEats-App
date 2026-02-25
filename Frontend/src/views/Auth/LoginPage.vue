<!-- Frontend/src/views/Auth/LoginPage.vue -->
<template>
  <div class="login-page">
    <div class="page-card login-card">
      <div class="logo-container text-center mb-20">
        <h2 style="color: var(--color-primary-orange);">Kasi Eats</h2>
        <p>Login to your account</p>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <div class="form-group">
          <label for="role">Login As:</label>
          <select id="role" v-model="selectedRole" required>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="driver">Driver</option>
          </select>
        </div>
        <PrimaryButton 
          :text="loading ? 'Logging in...' : 'Login'" 
          type="primary" 
          :fullWidth="true" 
          class="mt-20" 
          :disabled="loading"
        />
      </form>

      <p class="text-center mt-20">
        Don't have an account? <RouterLink to="/register">Register here</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import PrimaryButton from '../../components/Shared/PrimaryButton.vue';
import axios from 'axios';

const email = ref('');
const password = ref('');
const selectedRole = ref('customer');
const loading = ref(false);
const error = ref('');
const success = ref('');
const router = useRouter();

const handleLogin = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    const response = await axios.post('http://localhost:5401/api/auth/login', {
      email: email.value,
      password: password.value,
      role: selectedRole.value
    });

    if (response.data.success) {
      const userData = response.data.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      success.value = 'Login successful! Redirecting...';
      
      setTimeout(() => {
        window.loginAs(selectedRole.value);
      }, 1000);
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.response?.data?.error || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>

/* Keep existing styles, removed the generic button style if it was there */



.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #dfd1c6, #ff9e16);
  overflow: hidden;
}

.login-page::before {
  content: "";
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  top: -100px;
  right: -100px;
  filter: blur(100px);
}

.login-card {
  background-color: rgb(238, 248, 248);
  width: 100%;
  max-width: 480px;   /* was 400px */
  padding: 50px;      /* was 40px */
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.logo-container {
  margin-bottom: 20px;

}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input[type="email"],
.form-group input[type="password"],
.form-group select {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid var(--color-border-light);
  border-radius: 5px;
  font-size: 1em;
  background-color: white;
}

.mt-20 {
  margin-top: 20px;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
  border: 1px solid #ef9a9a;
}

.success-message {
  background-color: #e8f5e8;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
  border: 1px solid #a5d6a7;
}
</style>
