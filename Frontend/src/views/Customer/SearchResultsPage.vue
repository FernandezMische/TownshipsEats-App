<!-- Frontend/src/views/Customer/SearchResultsPage.vue -->
<template>
  <div class="search-results-page">
    <div class="page-card search-card">
      <h2 class="text-center mb-20">Search Results</h2>

      <div class="search-input-container mb-20">
        <input type="text" v-model="searchTerm" placeholder="Search for dishes or restaurants..." @keyup.enter="performSearch">
        <PrimaryButton text="Search" type="primary" @click="performSearch" />
      </div>

      <p class="text-center mb-20" v-if="results.length === 0 && searched">No results found for "{{ lastSearchTerm }}".</p>
      <p class="text-center mb-20" v-else-if="!searched">Start by searching for something delicious!</p>

      <div class="results-list" v-else>
        <div v-for="item in results" :key="item.id" class="result-item flex-between">
          <div class="item-info">
            <img :src="item.image" :alt="item.name" class="item-image">
            <div>
              <h3>{{ item.name }}</h3>
              <p class="item-description">{{ item.type }} - {{ item.restaurant }}</p>
              <span class="item-rating">{{ item.rating }} <i class="star-icon">★</i></span>
            </div>
          </div>
          <div class="item-actions">
            <span class="item-price">R{{ item.price.toFixed(2) }}</span>
            <PrimaryButton text="Add to Cart" type="primary" @click="addToCart(item)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PrimaryButton from '../../components/Shared/PrimaryButton.vue';
import axios from 'axios';

const router = useRouter();
const searchTerm = ref('');
const lastSearchTerm = ref('');
const results = ref([]);
const searched = ref(false);

// Dummy data for simulation with vendor_ids added
const allDishes = [
  { id: 101, name: 'Kota Special', type: 'Traditional', restaurant: 'Kasi Flavours', price: 60.00, rating: 4.5, image: 'https://loremflickr.com/50/50/sandwich,sub?lock=301', vendor_id: 1 },
  { id: 102, name: 'Mogodu & Pap', type: 'Traditional', restaurant: 'Kasi Flavours', price: 75.00, rating: 4.6, image: 'https://loremflickr.com/50/50/porridge,stew?lock=302', vendor_id: 1 },
  { id: 103, name: 'Skop', type: 'Traditional', restaurant: 'Kasi Flavours', price: 90.00, rating: 4.4, image: 'https://loremflickr.com/50/50/meat,roasted?lock=303', vendor_id: 1 },
  { id: 201, name: 'Mixed Grill Platter', type: 'Shisanyama', restaurant: 'Vusi\'s Shisanyama', price: 250.00, rating: 4.9, image: 'https://loremflickr.com/50/50/barbecue,steak?lock=304', vendor_id: 2 },
  { id: 202, name: 'Quarter Chicken', type: 'Shisanyama', restaurant: 'Vusi\'s Shisanyama', price: 65.00, rating: 4.7, image: 'https://loremflickr.com/50/50/chicken,fries?lock=305', vendor_id: 2 },
  { id: 301, name: 'Cheese Burger', type: 'Burgers', restaurant: 'Gourmet Grills', price: 85.00, rating: 4.8, image: 'https://loremflickr.com/50/50/burger,cheese?lock=307', vendor_id: 3 },
  { id: 302, name: 'Ribs Platter', type: 'BBQ', restaurant: 'Gourmet Grills', price: 150.00, rating: 4.9, image: 'https://loremflickr.com/50/50/ribs,bbq?lock=308', vendor_id: 3 },
  { id: 401, name: 'Hardbody Chicken', type: 'Home Cooked', restaurant: 'Mama Nandi\'s Kitchen', price: 85.00, rating: 4.8, image: 'https://loremflickr.com/50/50/chicken,stew?lock=310', vendor_id: 4 },
  { id: 402, name: 'Dombolo & Stew', type: 'Home Cooked', restaurant: 'Mama Nandi\'s Kitchen', price: 80.00, rating: 4.7, image: 'https://loremflickr.com/50/50/dumplings,stew?lock=311', vendor_id: 4 },
  { id: 501, name: 'The Boss Kota', type: 'Street Food', restaurant: 'Kasi King Kotas', price: 95.00, rating: 4.8, image: 'https://loremflickr.com/50/50/sandwich,huge?lock=313', vendor_id: 5 },
  { id: 503, name: 'Russian & Chips', type: 'Street Food', restaurant: 'Kasi King Kotas', price: 45.00, rating: 4.3, image: 'https://loremflickr.com/50/50/hotdog,fries?lock=315', vendor_id: 5 },
  { id: 601, name: 'Meaty Supreme Pizza', type: 'Italian', restaurant: 'Pizza Zone', price: 130.00, rating: 4.5, image: 'https://loremflickr.com/50/50/pizza,meat?lock=316', vendor_id: 6 },
];

const performSearch = () => {
  lastSearchTerm.value = searchTerm.value;
  searched.value = true;
  if (!searchTerm.value) {
    results.value = [];
    return;
  }
  const query = searchTerm.value.toLowerCase();
  results.value = allDishes.filter(dish =>
    dish.name.toLowerCase().includes(query) ||
    dish.restaurant.toLowerCase().includes(query) ||
    dish.type.toLowerCase().includes(query)
  );
};

const addToCart = async (item) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to cart');
      router.push('/login');
      return;
    }

    const response = await axios.post('https://townships-eats-backend.onrender.com/api/cart/add', {
      vendor_id: item.vendor_id,
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
.search-results-page {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  padding: 20px;
}

.search-card {
  max-width: 800px;
}

.search-input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.search-input-container input {
  flex-grow: 1;
  padding: 10px 15px;
  border: 1px solid var(--color-border-light);
  border-radius: 5px;
  font-size: 1em;
}

.results-list {
  margin-top: 20px;
}

.result-item {
  background-color: var(--color-background-light);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: left;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid var(--color-border-light);
}

.item-info h3 {
  margin: 0;
  color: var(--color-text-dark);
}

.item-description {
  margin: 0;
  font-size: 0.9em;
  color: var(--color-grey-text);
}

.item-rating {
  font-size: 0.9em;
  color: var(--color-primary-orange);
  font-weight: bold;
}

.star-icon {
  font-size: 1em;
  line-height: 1;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-price {
  font-weight: bold;
  color: var(--color-primary-orange);
  font-size: 1.1em;
}
</style>