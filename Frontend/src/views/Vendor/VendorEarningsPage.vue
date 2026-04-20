<template>
  <div class="vendor-earnings-page">
    <AppHeader title="Earnings & Reports" show-back-button />

    <main class="main-content container">
      <div v-if="loading" class="text-center">
        <div class="spinner"></div>
        <p>Loading earnings...</p>
      </div>

      <div v-else>
        <div class="balance-card">
          <h2>Available Balance</h2>
          <p class="balance-amount">R{{ formatMoney(earningsData.availableBalance) }}</p>
        </div>

        <div class="filters">
          <select v-model="reportPeriod" @change="fetchEarnings(reportPeriod)">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div class="earnings-card">
          <h3>Total Earnings</h3>
          <p class="earnings-amount">R{{ formatMoney(earningsData.earnings) }}</p>
          <p>Total Orders: {{ earningsData.totalOrders }}</p>
        </div>

        <div v-if="earningsData.orders && earningsData.orders.length > 0" class="orders-list">
          <h4>Recent Paid Orders</h4>
          <div v-for="order in earningsData.orders" :key="order.id" class="order-item">
            <span>{{ order.order_number }}</span>
            <span>R{{ formatMoney(order.total_amount) }}</span>
            <span>{{ formatDate(order.created_at) }}</span>
          </div>
        </div>
        <div v-else class="no-orders">
          <p>No paid orders in this period.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import AppHeader from '@/components/Shared/AppHeader.vue';

const router = useRouter();
const loading = ref(true);
const reportPeriod = ref('month');
const earningsData = ref({
  earnings: 0,
  totalOrders: 0,
  orders: [],
  availableBalance: 0
});

const formatMoney = (value) => {
  const num = Number(value || 0);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const fetchEarnings = async (period) => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return;
    }

    const response = await axios.get(`https://townships-eats-backend.onrender.com/api/vendor/earnings?period=${period}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Earnings response:', response.data);
    
    if (response.data.success) {
      earningsData.value = {
        earnings: response.data.data.earnings || 0,
        totalOrders: response.data.data.totalOrders || 0,
        orders: response.data.data.orders || [],
        availableBalance: response.data.data.availableBalance || 0
      };
    }
  } catch (error) {
    console.error('Error fetching earnings:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('Unauthorized, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const token = localStorage.getItem('token');
  console.log('Mounted - Token:', token);
  
  if (!token) {
    console.log('No token on mount, redirecting');
    router.push('/login');
  } else {
    fetchEarnings(reportPeriod.value);
  }
});
</script>

<style scoped>
.vendor-earnings-page {
  padding: 20px;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  min-height: 100vh;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
}

.balance-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.balance-amount {
  font-size: 2em;
  color: #4caf50;
  font-weight: bold;
}

.filters {
  margin-bottom: 20px;
  text-align: right;
}

.filters select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.earnings-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.earnings-amount {
  font-size: 1.8em;
  color: #ff6b35;
  font-weight: bold;
}

.orders-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.no-orders {
  text-align: center;
  color: #999;
  padding: 20px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>