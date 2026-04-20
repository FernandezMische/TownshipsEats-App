<!-- Frontend/src/views/Static/ContactPage.vue -->
<template>
  <div class="contact-page">
    <div class="page-card contact-card">
      <h2 class="text-center mb-20">Contact Us</h2>
      <p class="text-center intro-text mb-40">
        We'd love to hear from you! Reach out with any questions, feedback, or support needs.
      </p>

      <div v-if="success" class="success-message">{{ success }}</div>
      <div v-if="error" class="error-message">{{ error }}</div>

      <!-- Debug: Show current user -->
      <div v-if="currentUser" class="debug-info">
        Logged in as: {{ currentUser.username }} ({{ currentUser.role }})
      </div>
      <div v-else class="debug-info">
        Not logged in (Guest)
      </div>

      <form @submit.prevent="submitForm" class="contact-form">
        <!-- Contact Type Selection -->
        <div class="form-group">
          <label for="contactType">I want to contact:</label>
          <select id="contactType" v-model="form.contactType" required>
            <option value="">Select who to contact</option>
            <option value="vendor">A Vendor</option>
            <option value="driver">A Driver</option>
            <option value="support">Customer Support</option>
          </select>
        </div>

        <div class="form-group">
          <label for="name">Your Name:</label>
          <input type="text" id="name" v-model="form.customerName" required>
        </div>
        
        <div class="form-group">
          <label for="email">Your Email:</label>
          <input type="email" id="email" v-model="form.customerEmail" required>
        </div>
        
        <div class="form-group">
          <label for="subject">Subject:</label>
          <input type="text" id="subject" v-model="form.subject" required>
        </div>
        
        <div class="form-group">
          <label for="message">Message:</label>
          <textarea id="message" v-model="form.message" rows="6" required></textarea>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Message' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth.js';

const authStore = useAuthStore();
const currentUser = authStore.user;

const form = ref({
  customerName: currentUser?.username || '',
  customerEmail: currentUser?.email || '',
  subject: '',
  message: '',
  contactType: '',
  senderRole: currentUser?.role || 'guest',
  senderId: currentUser?.id || null
});

const loading = ref(false);
const success = ref('');
const error = ref('');

// Pre-fill form with user data
onMounted(() => {
  if (currentUser) {
    form.value.customerName = currentUser.username;
    form.value.customerEmail = currentUser.email;
    form.value.senderId = currentUser.id;
    form.value.senderRole = currentUser.role;
  }
});

const submitForm = async () => {
  loading.value = true;
  success.value = '';
  error.value = '';

  try {
    const response = await axios.post('https://townships-eats-backend.onrender.com/api/contact', {
      senderId: form.value.senderId,
      senderRole: form.value.senderRole,
      senderName: form.value.customerName,
      senderEmail: form.value.customerEmail,
      receiverType: form.value.contactType || 'support',
      subject: form.value.subject,
      message: form.value.message
    });
    
    if (response.data.success) {
      success.value = 'Message sent successfully!';
      form.value.subject = '';
      form.value.message = '';
      form.value.contactType = '';
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to send message';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.contact-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
}

.contact-card {
  max-width: 600px;
  width: 100%;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #ff5722;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #ef9a9a;
}

.success-message {
  background-color: #e8f5e8;
  color: #2e7d32;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #a5d6a7;
}

.debug-info {
  background-color: #e3f2fd;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #90caf9;
  color: #1976d2;
}
</style>