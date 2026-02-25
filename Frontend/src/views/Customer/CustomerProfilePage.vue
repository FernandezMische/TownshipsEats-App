<!-- Frontend/src/views/Customer/CustomerProfilePage.vue -->
<template>
  <div class="profile-page">
    <div class="page-card profile-card">
      <h2 class="text-center mb-20">Your Profile</h2>

      <div v-if="loading" class="text-center">
        <p>Loading profile...</p>
      </div>
      <div v-else class="profile-details">
        <div class="form-group">
          <label for="username">Name</label>
          <input
            id="username"
            type="text"
            v-model.trim="form.username"
            :disabled="!isEditing"
          >
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            v-model.trim="form.email"
            :disabled="!isEditing"
          >
        </div>
        <div class="form-group">
          <label for="address">Address</label>
          <textarea
            id="address"
            v-model.trim="form.address"
            :disabled="!isEditing"
            rows="3"
            placeholder="Add your delivery address"
          ></textarea>
        </div>
        <div class="detail-item">
          <span class="label">Role:</span>
          <span class="value">{{ profile.role || 'customer' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Joined:</span>
          <span class="value">{{ formatDate(profile.created_at) }}</span>
        </div>
      </div>

      <p v-if="errorMessage" class="error-message text-center">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message text-center">{{ successMessage }}</p>

      <div class="text-center mt-20 actions">
        <PrimaryButton
          v-if="!isEditing"
          text="Edit Profile"
          type="primary"
          @click="startEditing"
        />
        <PrimaryButton
          v-else
          :text="saving ? 'Saving...' : 'Save Changes'"
          type="success"
          :disabled="saving"
          @click="saveProfile"
        />
        <PrimaryButton
          v-if="isEditing"
          text="Cancel"
          type="secondary"
          :disabled="saving"
          @click="cancelEditing"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import PrimaryButton from '../../components/Shared/PrimaryButton.vue';

const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const isEditing = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const profile = ref({
  username: '',
  email: '',
  address: '',
  role: 'customer',
  created_at: null
});

const form = ref({
  username: '',
  email: '',
  address: ''
});

const getToken = () => localStorage.getItem('token');

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString();
};

const syncFormFromProfile = () => {
  form.value.username = profile.value.username || '';
  form.value.email = profile.value.email || '';
  form.value.address = profile.value.address || '';
};

const loadProfile = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await axios.get('http://localhost:5401/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data?.success) {
      profile.value = response.data.data;
      syncFormFromProfile();
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    errorMessage.value = error.response?.data?.error || 'Failed to load profile';
  } finally {
    loading.value = false;
  }
};

const startEditing = () => {
  successMessage.value = '';
  errorMessage.value = '';
  isEditing.value = true;
  syncFormFromProfile();
};

const cancelEditing = () => {
  isEditing.value = false;
  errorMessage.value = '';
  successMessage.value = '';
  syncFormFromProfile();
};

const saveProfile = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!form.value.username || !form.value.email) {
    errorMessage.value = 'Name and email are required';
    return;
  }

  try {
    saving.value = true;
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await axios.put(
      'http://localhost:5401/api/auth/me',
      {
        username: form.value.username,
        email: form.value.email,
        address: form.value.address
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data?.success) {
      profile.value = response.data.data;
      isEditing.value = false;
      successMessage.value = 'Profile updated successfully';

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...currentUser,
          username: profile.value.username,
          email: profile.value.email,
          address: profile.value.address
        })
      );
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    errorMessage.value = error.response?.data?.error || 'Failed to update profile';
  } finally {
    saving.value = false;
  }
};

onMounted(loadProfile);
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  padding: 20px;
}

.profile-card {
  max-width: 600px;
  width: 100%;
}

.profile-details {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid var(--color-border-light);
  border-radius: 6px;
  font-size: 1rem;
}

.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid var(--color-border-light);
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
}

.form-group input:disabled,
.form-group textarea:disabled {
  background-color: #f4f4f4;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed var(--color-border-light);
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: var(--color-grey-text);
  min-width: 100px;
  text-align: left;
}

.value {
  color: var(--color-text-dark);
  text-align: right;
  flex-grow: 1;
}

.mt-20 {
  margin-top: 20px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.error-message {
  color: #c62828;
  margin-top: 12px;
}

.success-message {
  color: #2e7d32;
  margin-top: 12px;
}
</style>
