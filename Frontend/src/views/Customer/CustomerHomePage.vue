<!-- Frontend/src/views/Customer/CustomerHomePage.vue -->
<template>
  <div class="customer-home-page">
    <div class="page-card home-card">
      <h2 class="text-center mb-20">Welcome to Kasi Eats!</h2>
      <p class="text-center mb-20">Discover delicious food from local vendors.</p>

      <div class="section">
        <h3>Featured Vendors</h3>
        <div class="vendor-list">
          <VendorCard v-for="vendor in featuredVendors" :key="vendor.id" :vendor="vendor" />
        </div>
      </div>

      <div class="section mt-40">
        <h3>Popular Categories</h3>
        <div class="category-list">
          <div v-for="category in popularCategories" :key="category.id" class="home-category-item">
            <img :src="category.image" :alt="category.name" class="home-category-image">
            <h5>{{ category.name }}</h5>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VendorCard from '../../components/Customer/VendorCard.vue'; // Import VendorCard

const featuredVendors = ref([
  { id: 1, name: 'Kasi Flavours', cuisine: 'Traditional SA', image: 'https://i.pinimg.com/1200x/87/eb/f1/87ebf13722da82e08a2b6507d1fe101c.jpg', rating: 4.5, reviews: 120 },
  { id: 2, name: 'Vusi\'s Shisanyama', cuisine: 'Braai & Meat', image: 'https://i.pinimg.com/736x/15/b5/59/15b559a8e4d158a5a0f7e30ed1330f2d.jpg', rating: 4.9, reviews: 200 },
  { id: 3, name: 'Gourmet Grills', cuisine: 'Burgers & BBQ', image: 'https://loremflickr.com/120/120/burger', rating: 4.8, reviews: 95 },
  { id: 4, name: 'Mama Nandi\'s Kitchen', cuisine: 'Home Cooked', image: 'https://i.pinimg.com/1200x/63/68/03/636803f6a7e2b6d07fbfedcef46ad256.jpg', rating: 4.7, reviews: 150 },
  { id: 5, name: 'Kasi King Kotas', cuisine: 'Street Food', image: 'https://i.pinimg.com/736x/ef/05/25/ef0525a24b2aedc4c63ff55f587a4f2b.jpg', rating: 4.6, reviews: 180 },
  { id: 6, name: 'Pizza Zone', cuisine: 'Italian', image: 'https://loremflickr.com/120/120/pizza', rating: 4.0, reviews: 150 },
]);

const popularCategories = ref([
  { id: 1, name: 'Shisanyama', image: 'https://i.pinimg.com/1200x/da/4c/d8/da4cd88ffd5c4146c4604ecdc969eb0c.jpg' },
  { id: 2, name: 'Kotas', image: 'https://i.pinimg.com/736x/bf/aa/9b/bfaa9bda8c7a9492502cc1501ddf73cf.jpg' },
  { id: 3, name: 'Mogodu', image: 'https://i.pinimg.com/1200x/9d/e3/6f/9de36f0bd19bb7b23683cbe98bf93e00.jpg' },
  { id: 4, name: 'Street Food', image: 'https://i.pinimg.com/736x/40/02/ed/4002ed97e3653904f35f72a27efb0856.jpg' },
  { id: 5, name: 'Chicken', image: 'https://i.pinimg.com/1200x/55/fe/d0/55fed072ead198753045ca62b83b0baa.jpg' },
  { id: 6, name: 'Bakery', image: 'https://loremflickr.com/80/80/bread' },
]);
</script>

<style scoped>

.customer-home-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  display: flex;
  justify-content: center;
}

.home-card {
  max-width: 1200px;
  width: 100%;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
}

/* Welcome Section */
.home-card h2 {
  font-size: 2rem;
  color: var(--color-text-dark);
}

.home-card p {
  font-size: 1.1rem;
  color: #666;
}

/* Section Styling */
.section {
  margin-top: 50px;
}

.section h3 {
  position: relative;
  font-size: 1.6em;
  margin-bottom: 30px;
  color: var(--color-text-dark);
  display: inline-block;
}

/* Animated underline */
.section h3::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, #ff7a18, #ffb347);
  border-radius: 10px;
}

/* Vendor Grid */
.vendor-list {
  display: grid;
  gap: 25px;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

/* Category Grid */
.category-list {
  display: grid;
  gap: 25px;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
}

/* Category Card */
.home-category-item {
  background: white;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.home-category-item:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

/* Category Image */
.home-category-image {
  width: 85px;
  height: 85px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 12px;
  border: 4px solid #ffb347;
  transition: transform 0.3s ease;
}

.home-category-item:hover .home-category-image {
  transform: scale(1.1);
}

/* Category Text */
.home-category-item h5 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-dark);
  font-weight: 600;
}



















</style>
