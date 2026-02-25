<!-- Frontend/src/views/Vendor/DishFormPage.vue -->
<template>
  <div class="dish-form-page">
    <div class="page-card dish-form-card">
      <BackButton class="mb-20">Back to Menu Management</BackButton>
      <h2 class="text-center mb-20">{{ isEditing? 'Edit Dish' : 'Add New Dish' }}</h2>
      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="form-success">{{ successMessage }}</p>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="dishName">Dish Name:</label>
          <input type="text" id="dishName" v-model="dish.name" required>
        </div>
        <div class="form-group">
          <label for="dishDescription">Description:</label>
          <textarea id="dishDescription" v-model="dish.description" rows="4" required></textarea>
        </div>
        <div class="form-group">
          <label for="dishPrice">Price (R):</label>
          <input type="number" id="dishPrice" v-model="dish.price" min="0" step="0.01" required>
        </div>
        <div class="form-group">
          <label for="dishImage">Image URL:</label>
          <input type="url" id="dishImage" v-model="dish.image" placeholder="e.g., https://loremflickr.com/320/240/food">
        </div>
        <div class="form-group">
          <label for="dishCategory">Category:</label>
          <select id="dishCategory" v-model="dish.category_id" required>
            <option value="">Select a Category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <PrimaryButton :text="submitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing? 'Update Dish' : 'Add Dish')" type="primary" :fullWidth="true" class="mt-20" />
        <PrimaryButton v-if="isEditing" text="Cancel" type="secondary" :fullWidth="true" class="mt-10" @click.prevent="router.push('/vendor/menu-management')" />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BackButton from '../../components/Shared/BackButton.vue';
import PrimaryButton from '../../components/Shared/PrimaryButton.vue';

const route = useRoute();
const router = useRouter();

const isEditing = ref(false);
const submitting = ref(false);
const categories = ref([]);
const errorMessage = ref('');
const successMessage = ref('');
const dish = ref({
  id: null,
  name: '',
  description: '',
  price: 0.00,
  image: '',
  category_id: '',
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    throw new Error('Not authenticated');
  }
  return { Authorization: `Bearer ${token}` };
};

const fetchCategories = async () => {
  const response = await axios.get('http://localhost:5401/api/categories');
  categories.value = response.data?.data || [];
};

const fetchDishForEdit = async (dishId) => {
  const response = await axios.get('http://localhost:5401/api/vendor/menu', {
    headers: getAuthHeaders()
  });
  const existingDish = (response.data?.data || []).find((d) => Number(d.id) === Number(dishId));
  if (!existingDish) {
    throw new Error('Dish not found');
  }
  dish.value = {
    id: existingDish.id,
    name: existingDish.name || '',
    description: existingDish.description || '',
    price: Number(existingDish.price || 0),
    image: existingDish.image || '',
    category_id: existingDish.category_id || ''
  };
};

onMounted(async () => {
  try {
    await fetchCategories();
    if (route.params.id) {
      isEditing.value = true;
      await fetchDishForEdit(route.params.id);
    }
  } catch (error) {
    console.error('Error loading form data:', error);
    errorMessage.value = error.response?.data?.error || error.message || 'Failed to load dish data';
    if (isEditing.value) {
      setTimeout(() => router.push('/vendor/menu-management'), 1200);
    }
  }
});

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  submitting.value = true;

  try {
    const payload = {
      name: dish.value.name,
      description: dish.value.description,
      price: Number(dish.value.price),
      category_id: Number(dish.value.category_id)
    };

    if (!payload.category_id) {
      throw new Error('Please select a category');
    }

    if (isEditing.value) {
      await axios.put(`http://localhost:5401/api/vendor/menu/${dish.value.id}`, payload, {
        headers: getAuthHeaders()
      });
      successMessage.value = 'Dish updated successfully.';
    } else {
      await axios.post('http://localhost:5401/api/vendor/menu', payload, {
        headers: getAuthHeaders()
      });
      successMessage.value = 'Dish added successfully.';
    }

    setTimeout(() => {
      router.push('/vendor/menu-management');
    }, 500);
  } catch (error) {
    console.error('Error saving dish:', error);
    errorMessage.value = error.response?.data?.error || error.message || 'Failed to save dish';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.dish-form-page {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  padding: 20px;
}

.dish-form-card {
  max-width: 600px;
  width: 100%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--color-text-dark);
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="url"],
.form-group textarea,
.form-group select {
  width: calc(100% - 22px);
  padding: 10px;
  border: 1px solid var(--color-border-light);
  border-radius: 5px;
  font-size: 1em;
  background-color: var(--color-background-light);
  color: var(--color-text-dark);
}

.form-group textarea {
  resize: vertical;
}

.mt-10 {
  margin-top: 10px;
}

.form-error {
  color: #c62828;
  background: #ffebee;
  border: 1px solid #ef9a9a;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.form-success {
  color: #2e7d32;
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}
</style>
