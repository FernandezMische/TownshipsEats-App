<!-- Frontend/src/components/Shared/AppFooter.vue -->
<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>&copy; {{ currentYear }} Kasi Eats. All rights reserved.</p>
      <nav class="footer-nav">
        <RouterLink to="/about" class="footer-link">About Us</RouterLink>
        <RouterLink to="/contact" class="footer-link">Contact</RouterLink>
        <RouterLink to="/privacy" class="footer-link">Privacy Policy</RouterLink>
      </nav>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.app-footer {
  position: relative;
  background: linear-gradient(135deg, #28817c, #2c2c2c);
  color: #f5f5f5;
  padding: 35px 25px;
  margin-top: 40px;
  overflow: hidden;
}

/* Soft glowing top border */
.app-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #d5bdac, #a48a65);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
}

.app-footer p {
  margin: 0;
  font-size: 0.95em;
  opacity: 0.8;
  letter-spacing: 0.5px;
}

.footer-nav {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: #f5f5f5;
  text-decoration: none;
  font-size: 0.95em;
  font-weight: 500;
  position: relative;
  transition: all 0.3s ease;
}

/* Smooth underline animation */
.footer-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0%;
  height: 2px;
  background: #ffbb8a;
  transition: width 0.3s ease;
}

.footer-link:hover {
  color: #ffb347;
}

.footer-link:hover::after {
  width: 100%;
}
</style>
