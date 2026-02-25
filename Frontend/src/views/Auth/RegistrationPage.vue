<!-- Frontend/src/views/Auth/RegistrationPage.vue -->
<template>
  <div class="registration-page">
    <div class="page-card registration-card">
      <div class="text-center mb-20">
        <h2 style="color: var(--color-primary-orange);">Register for Kasi Eats</h2>
        <p>Create your new account</p>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required>
        </div>
        
        <!-- ✅ NEW: Role selection dropdown (only this added) -->
        <div class="form-group">
          <label for="role">Register As:</label>
          <select id="role" v-model="selectedRole" required>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="driver">Driver</option>
          </select>
        </div>

        <PrimaryButton 
          :text="loading ? 'Registering...' : 'Register'" 
          type="primary" 
          :fullWidth="true" 
          class="mt-20" 
          :disabled="loading"
        />
      </form>

      <p class="text-center mt-20">
        Already have an account? <RouterLink to="/login">Login here</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import PrimaryButton from '../../components/Shared/PrimaryButton.vue';
import axios from 'axios';

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const selectedRole = ref('customer'); // ✅ NEW: Default to customer
const loading = ref(false);
const error = ref('');
const success = ref('');
const router = useRouter();

const handleRegister = async () => {
  error.value = '';
  success.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match!';
    return;
  }

  loading.value = true;

  try {
    // ✅ NEW: Include selectedRole in the request
    const response = await axios.post('http://localhost:5401/api/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value,
      role: selectedRole.value  // This sends the role to backend
    });

    if (response.data.success) {
      success.value = 'Registration successful! Redirecting to login...';
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.response?.data?.error || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* YOUR EXACT CSS - NOTHING CHANGED */
.registration-page {
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

.registration-card {
  background-color: rgb(238, 248, 248);
  width: 100%;
  max-width: 480px;
  padding: 50px;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
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

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group select {  /* ✅ This was already in your Login CSS, just making sure select styled too */
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid var(--color-border-light);
  border-radius: 5px;
  font-size: 1em;
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
