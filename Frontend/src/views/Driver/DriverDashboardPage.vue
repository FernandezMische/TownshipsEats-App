<!-- Frontend/src/views/Driver/DriverDashboardPage.vue -->
<template>
  <div class="driver-dashboard-page">
    <div class="page-card dashboard-card">
      <h2 class="text-center">Driver Dashboard</h2>
      <p class="text-center">Welcome, {{ driverName }}! Ready for your next delivery?</p>

      <div class="dashboard-stats">
        <div class="stat-item">
          <h3>Deliveries Today</h3>
          <p class="stat-value">{{ deliveriesToday }}</p>
        </div>
        <div class="stat-item">
          <h3>Earnings Today</h3>
          <p class="stat-value">R{{ earningsToday.toFixed(2) }}</p>
        </div>
      </div>

      <h3 class="mt-40 mb-20 text-center">Available Deliveries</h3>

      <div v-if="loading" class="text-center">
        <p>Loading available deliveries...</p>
      </div>
      <div v-else-if="errorMessage" class="text-center error-message">
        <p>{{ errorMessage }}</p>
      </div>
      <div v-else-if="availableDeliveries.length > 0" class="delivery-list">
        <div v-for="delivery in availableDeliveries" :key="delivery.id" class="delivery-item">
          <div class="delivery-details">
            <h4>Order #{{ delivery.orderNumber }}</h4>
            <p><strong>Status:</strong> {{ formatStatus(delivery.status) }}</p>
            <p><strong>Pickup:</strong> {{ delivery.pickupLocation }}</p>
            <p><strong>Dropoff:</strong> {{ delivery.dropoffLocation }}</p>
            <p><strong>Est. Earnings:</strong> R{{ Number(delivery.earning).toFixed(2) }}</p>
          </div>
          <PrimaryButton
            text="Accept"
            type="success"
            @click="acceptDelivery(delivery.id)"
          />
        </div>
      </div>
      <div v-else class="text-center">
        <p>No available deliveries right now. Check back soon!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import PrimaryButton from '../../components/Shared/PrimaryButton.vue';

const router = useRouter();
const loading = ref(true);
const errorMessage = ref('');
const deliveriesToday = ref(0);
const earningsToday = ref(0.0);
const availableDeliveries = ref([]);
const driverName = ref('Driver');
let refreshTimer = null;

const getTokenOrRedirect = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    throw new Error('Not authenticated');
  }
  return token;
};

const loadDashboard = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const token = getTokenOrRedirect();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    driverName.value = user.username || 'Driver';

    const response = await axios.get('http://localhost:5401/api/driver/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data?.success) {
      availableDeliveries.value = response.data.data.availableDeliveries || [];
      deliveriesToday.value = Number(response.data.data.stats?.deliveriesToday || 0);
      earningsToday.value = Number(response.data.data.stats?.earningsToday || 0);
    }
  } catch (error) {
    console.error('Error loading driver dashboard:', error);
    errorMessage.value = error.response?.data?.error || error.message || 'Failed to load dashboard';
  } finally {
    loading.value = false;
  }
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const acceptDelivery = async (orderId) => {
  try {
    const token = getTokenOrRedirect();
    await axios.post(
      `http://localhost:5401/api/driver/deliveries/${orderId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await loadDashboard();
  } catch (error) {
    console.error('Error accepting delivery:', error);
    alert(error.response?.data?.error || 'Failed to accept delivery');
  }
};

onMounted(() => {
  loadDashboard();
  // Keep dashboard fresh so vendor-accepted orders appear automatically.
  refreshTimer = setInterval(loadDashboard, 10000);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped>
.driver-dashboard-page {
  display: flex;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  justify-content: center;
  padding: 20px;
}

.dashboard-card {
  max-width: 800px;
  width: 100%;
}

.dashboard-stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-top: 30px;
  text-align: center;
}

.stat-item {
  background-color: var(--color-background-light);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px;
  flex: 1;
}

.stat-item h3 {
  color: var(--color-grey-text);
  margin-bottom: 10px;
  font-size: 1.1em;
}

.stat-value {
  font-size: 2.2em;
  font-weight: bold;
  color: var(--color-primary-orange);
}

.delivery-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.delivery-item {
  background-color: var(--color-background-light);
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delivery-details {
  text-align: left;
}

.delivery-details h4 {
  margin: 0 0 5px;
  color: var(--color-text-dark);
}

.delivery-details p {
  margin: 0;
  font-size: 0.9em;
  color: var(--color-grey-text);
}

.error-message {
  color: #c62828;
}
</style>
