<!-- Frontend/src/views/Customer/VendorDetailPage.vue -->
<template>
  <div class="vendor-detail-page">
    <div class="page-card vendor-detail-card">
      <BackButton class="mb-20">Back to Home</BackButton>

      <div v-if="loading" class="text-center">
        <p>Loading vendor details...</p>
      </div>
      <div v-else-if="error" class="text-center">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="vendor">
        <h2 class="text-center mb-10">{{ vendor.name }}</h2>
        <p class="text-center vendor-cuisine mb-20">{{ vendor.cuisine }}</p>

        <img :src="bannerImage" :alt="vendor.name" class="vendor-banner">

        <h3 class="mt-40 mb-20">Menu</h3>
        <div class="menu-list">
          <MealCard v-for="item in vendor.menu" :key="item.id" :meal="item" @add-to-cart="handleAddToCart" />
        </div>
      </div>
      <div v-else class="text-center">
        <p>Vendor not found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BackButton from '../../components/Shared/BackButton.vue';
import MealCard from '../../components/Customer/MealCard.vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const vendor = ref(null);
const loading = ref(true);
const error = ref('');

const bannerImage = computed(() => {
  return vendor.value?.bannerImage || `https://loremflickr.com/800/200/restaurant,food?lock=${route.params.id}`;
});

onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await axios.get(`https://townships-eats-backend.onrender.com/api/vendors/${route.params.id}`);
    if (response.data?.success) {
      const data = response.data.data;
      vendor.value = {
        ...data,
        menu: (data.menu || []).map((item) => ({
          ...item,
          price: Number(item.price || 0),
          image: item.image || `https://loremflickr.com/90/90/meal?lock=${item.id}`
        }))
      };
    }
  } catch (err) {
    console.error('Error loading vendor details:', err);
    error.value = err.response?.data?.error || 'Failed to load vendor details';
  } finally {
    loading.value = false;
  }
});

const handleAddToCart = async (item) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to cart');
      router.push('/login');
      return;
    }

    const response = await axios.post('https://townships-eats-backend.onrender.com/api/cart/add', {
      vendor_id: vendor.value.id,
      menu_item_id: item.id,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      alert(`${item.name} added to cart!`);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Failed to add item to cart. Please try again.');
  }
};
</script>

<style scoped>
.vendor-detail-page {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  padding: 20px;
}

.vendor-detail-card {
  max-width: 900px;
  width: 100%;
  text-align: left;
}

.mb-20 {
  margin-bottom: 20px;
}

.vendor-cuisine {
  color: var(--color-grey-text);
  font-style: italic;
}

.vendor-banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 30px;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
