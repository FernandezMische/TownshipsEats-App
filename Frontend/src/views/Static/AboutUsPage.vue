<!-- Frontend/src/views/Static/AboutUsPage.vue -->
<template>
  <div class="about-us-page">
    <div class="page-card about-card">
      <h2 class="text-center mb-20">About Kasi Eats</h2>
      <p class="text-center intro-text mb-40">
        Bringing the heart of local cuisine directly to your doorstep.
      </p>

      <div class="section-content">
        <h3>Our Story</h3>
        <p>
          Kasi Eats was born from a passion for local food culture and a desire to empower township businesses. We believe that the vibrant, unique flavors of our communities deserve a platform that connects them with customers eager for authentic experiences. From a small idea to a growing network, we're dedicated to celebrating local talent and taste.
        </p>

        <h3>Our Mission</h3>
        <p>
          Our mission is twofold: to provide convenient access to delicious, locally-sourced meals for our customers, and to create sustainable growth opportunities for vendors within townships. We strive to build a community where quality food, entrepreneurship, and convenience thrive together.
        </p>

        <h3>The Team</h3>
        <p>
          We are a diverse team of food enthusiasts, tech innovators, and community advocates. Our shared vision drives us to continuously improve Kasi Eats, ensuring a seamless experience for everyone involved – from the vendor carefully preparing your meal to the driver delivering it with a smile.
        </p>
      </div>

      <div class="text-center mt-40">
        <PrimaryButton text="Join Our Community" type="primary" @click="goToRegister" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import PrimaryButton from '../../components/Shared/PrimaryButton.vue';

const router = useRouter();

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.about-us-page {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  padding: 20px;
}

.about-card {
  max-width: 800px;
  width: 100%;
  text-align: left;
}

.intro-text {
  font-size: 1.2em;
  color: var(--color-primary-orange);
  font-weight: bold;
}

.section-content h3 {
  color: var(--color-text-dark);
  margin-top: 30px;
  margin-bottom: 15px;
  border-bottom: 2px solid var(--color-border-light);
  padding-bottom: 5px;
}

.section-content p {
  line-height: 1.6;
  margin-bottom: 15px;
  color: var(--color-grey-text);
}
</style>
