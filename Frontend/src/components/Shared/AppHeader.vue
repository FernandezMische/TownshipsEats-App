<!-- Frontend/src/components/Shared/AppHeader.vue -->
<template>
  <header class="app-header-component">
    <div class="header-content flex-between">
      <RouterLink to="/" class="logo-link">
        <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="Kasi Eats Logo" class="app-logo">
        <h2 style="color: var(--color-primary-orange); margin: 0;">Kasi Eats</h2>
      </RouterLink>

      <nav class="main-nav">
        <!-- Conditional Navigation based on userRole -->
        <template v-if="userRole === 'customer'">
          <RouterLink to="/customer/home" class="nav-item">Home</RouterLink>
          <RouterLink to="/customer/categories" class="nav-item">Categories</RouterLink>
          <RouterLink to="/customer/favorites" class="nav-item">Favorites</RouterLink>
          <RouterLink to="/customer/profile" class="nav-item">Profile</RouterLink>
          <RouterLink to="/customer/cart" class="nav-item">Cart</RouterLink>
          <PrimaryButton @click="logout" text="Logout" type="danger" />
        </template>
        <template v-else-if="userRole === 'vendor'">
          <RouterLink to="/vendor/dashboard" class="nav-item">Dashboard</RouterLink>
          <RouterLink to="/vendor/menu-management" class="nav-item">Menu</RouterLink>
          <PrimaryButton @click="logout" text="Logout" type="danger" />
        </template>
        <template v-else-if="userRole === 'driver'">
          <RouterLink to="/driver/dashboard" class="nav-item">Dashboard</RouterLink>
          <PrimaryButton @click="logout" text="Logout" type="danger" />
        </template>
        <template v-else>
          <!-- Not logged in -->
          <RouterLink to="/login" class="nav-item">Login</RouterLink>
          <RouterLink to="/register" class="nav-item">Register</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { RouterLink } from 'vue-router';
import PrimaryButton from './PrimaryButton.vue'; // Import our new button component

const props = defineProps({
  userRole: {
    type: String, // 'customer', 'vendor', 'driver', null
    default: null,
  },
});

const emit = defineEmits(['logout']);

const logout = () => {
  emit('logout');
};
</script>

<style scoped>
.app-header-component {
  background: #ffffff;
  padding: 18px 40px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

/* Center content */
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo {
  height: 42px;
  transition: transform 0.3s ease;
}

.logo-link:hover .app-logo {
  transform: scale(1.08);
}

/* Navigation */
.main-nav {
  display: flex;
  align-items: center;
  gap: 30px;
}

/* Nav items */
.nav-item {
  font-weight: 600;
  color: #4b5563;
  text-decoration: none;
  font-size: 0.95rem;
  position: relative;
  transition: all 0.3s ease;
  padding-bottom: 6px;
}

/* Smooth underline animation */
.nav-item::after {
  content: "";
  position: absolute;
  width: 0%;
  height: 2px;
  background-color: var(--color-primary-orange);
  bottom: 0;
  left: 0;
  transition: width 0.3s ease;
}

.nav-item:hover {
  color: var(--color-primary-orange);
}

.nav-item:hover::after {
  width: 100%;
}

.nav-item.router-link-exact-active {
  color: var(--color-primary-orange);
}

.nav-item.router-link-exact-active::after {
  width: 100%;
}  

</style>
