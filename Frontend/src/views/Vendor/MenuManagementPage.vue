<!-- Frontend/src/views/Vendor/MenuManagementPage.vue -->
<template>
  <div class="menu-management-page">
    <div class="page-card menu-card">
      <BackButton class="mb-20">Back to Dashboard</BackButton>
      <h2 class="text-center mb-20">Menu Management</h2>
      <p class="text-center mb-20">Add, edit, or remove dishes from your menu.</p>

      <PrimaryButton text="Add New Dish" type="success" :fullWidth="false" class="add-dish-btn mb-20" @click="goToAddDish" />

      <div v-if="loading" class="text-center">
        <p>Loading menu...</p>
      </div>
      <div v-else-if="error" class="text-center">
        <p>{{ error }}</p>
      </div>
      <div v-else class="dish-list">
        <div v-for="dish in menuDishes" :key="dish.id" class="dish-item flex-between">
          <div class="dish-info">
            <img :src="dish.image" :alt="dish.name" class="dish-image">
            <div>
              <h4>{{ dish.name }}</h4>
              <p class="dish-description">{{ dish.description }}</p>
            </div>
          </div>
          <div class="dish-actions">
            <span class="dish-price">R{{ dish.price.toFixed(2) }}</span>
            <PrimaryButton text="Edit" type="primary" size="small" @click="goToEditDish(dish.id)" />
            <PrimaryButton text="Delete" type="danger" size="small" @click="deleteDish(dish.id)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import BackButton from '../../components/Shared/BackButton.vue';
import PrimaryButton from '../../components/Shared/PrimaryButton.vue';

const router = useRouter();
const loading = ref(true);
const error = ref('');
const menuDishes = ref([]);

const placeholderImage = 'https://via.placeholder.com/60x60?text=Dish';
const getTokenOrRedirect = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    throw new Error('Not authenticated');
  }
  return token;
};

const fetchMenu = async () => {
  loading.value = true;
  error.value = '';
  try {
    const token = getTokenOrRedirect();

    const response = await axios.get('http://localhost:5401/api/vendor/menu', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data?.success) {
      menuDishes.value = (response.data.data || []).map((dish) => ({
        ...dish,
        price: Number(dish.price || 0),
        image: dish.image || placeholderImage
      }));
    }
  } catch (err) {
    console.error('Error loading menu:', err);
    error.value = err.response?.data?.error || 'Failed to load menu';
  } finally {
    loading.value = false;
  }
};

const goToAddDish = () => {
  router.push({ name: 'AddDish' });
};

const goToEditDish = (dishId) => {
  router.push({ name: 'EditDish', params: { id: dishId } });
};

const deleteDish = async (dishId) => {
  if (confirm(`Are you sure you want to delete dish ID ${dishId}?`)) {
    try {
      const token = getTokenOrRedirect();
      await axios.delete(`http://localhost:5401/api/vendor/menu/${dishId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      menuDishes.value = menuDishes.value.filter(dish => dish.id !== dishId);
      alert('Dish deleted successfully.');
    } catch (err) {
      console.error('Error deleting dish:', err);
      alert(err.response?.data?.error || 'Failed to delete dish');
    }
  }
};

onMounted(() => {
  fetchMenu();
});
</script>

<style scoped>
/* (No changes to existing styles, ensure PrimaryButton size props are working if you define them in PrimaryButton.vue) */
.menu-management-page {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  padding: 20px;
}

.menu-card {
  max-width: 800px;
  width: 100%;
}

.add-dish-btn {
  margin-bottom: 20px;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dish-item {
  background-color: var(--color-background-light);
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
  padding: 15px;
  align-items: center;
}

.dish-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-grow: 1;
  text-align: left;
}

.dish-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid var(--color-border-light);
}

.dish-info h4 {
  margin: 0;
  color: var(--color-text-dark);
}

.dish-description {
  margin: 0;
  font-size: 0.9em;
  color: var(--color-grey-text);
}

.dish-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dish-price {
  font-weight: bold;
  color: var(--color-primary-orange);
  font-size: 1.1em;
  white-space: nowrap;
}
</style>
