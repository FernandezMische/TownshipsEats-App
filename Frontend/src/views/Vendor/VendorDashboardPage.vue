<!-- Frontend/src/views/Vendor/VendorDashboardPage.vue -->
<template>
  <div class="vendor-dashboard-page">
    <div class="page-card dashboard-card">
      <h2 class="text-center">Vendor Dashboard</h2>
      <p class="text-center">Welcome, {{ vendor?.business_name || vendorName }}! Manage your orders and menu here.</p>

      <div v-if="loading" class="text-center">
        <p>Loading dashboard...</p>
      </div>

      <div v-else class="dashboard-sections">
        <div class="section-item">
          <h3>Current Orders</h3>
          <p>You have <strong>{{ dashboard.currentOrders || 0 }}</strong> pending orders.</p>
          <p class="order-breakdown">
            <span class="badge pending">{{ dashboard.pendingOrders || 0 }} pending</span>
            <span class="badge preparing">{{ dashboard.preparingOrders || 0 }} preparing</span>
            <span class="badge ready">{{ dashboard.readyOrders || 0 }} ready</span>
          </p>
          <PrimaryButton text="View Orders" type="primary" @click="goToOrders" />
        </div>
        
        <div class="section-item">
          <h3>Menu Management</h3>
          <p>Update your dishes and prices.</p>
          <PrimaryButton text="Edit Menu" type="primary" @click="goToMenuManagement" />
        </div>
        
        <div class="section-item">
          <h3>Earnings Report</h3>
          <p>Today: <strong>R{{ formatMoney(dashboard.earnings?.today) }}</strong></p>
          <p>This Week: <strong>R{{ formatMoney(dashboard.earnings?.week) }}</strong></p>
          <p>This Month: <strong>R{{ formatMoney(dashboard.earnings?.month) }}</strong></p>
          <PrimaryButton text="View Reports" type="primary" @click="goToEarnings" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import PrimaryButton from '../../components/Shared/PrimaryButton.vue';

const router = useRouter();
const loading = ref(true);
const vendor = ref({});
const vendorName = ref('');
const dashboard = ref({
  currentOrders: 0,
  pendingOrders: 0,
  preparingOrders: 0,
  readyOrders: 0,
  earnings: {
    today: 0,
    week: 0,
    month: 0
  }
});

const formatMoney = (value) => {
  const num = Number(value || 0);
  return num.toFixed(2);
};

const fetchDashboard = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Fetching vendor dashboard with token:', token);
    
    const response = await axios.get('http://localhost:5401/api/vendor/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Dashboard response:', response.data);
    
    if (response.data.success) {
      vendor.value = response.data.data.vendor || {};
      vendorName.value = vendor.value?.name || '';
      
      dashboard.value = {
        currentOrders: response.data.data.currentOrders || 0,
        pendingOrders: response.data.data.pendingOrders || 0,
        preparingOrders: response.data.data.preparingOrders || 0,
        readyOrders: response.data.data.readyOrders || 0,
        earnings: {
          today: response.data.data.earnings?.today || 0,
          week: response.data.data.earnings?.week || 0,
          month: response.data.data.earnings?.month || 0
        }
      };
    }
  } catch (error) {
    console.error('Error fetching dashboard:', error.response?.data || error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboard();
});

const goToOrders = () => {
  router.push('/vendor/orders');
};

const goToMenuManagement = () => {
  router.push('/vendor/menu-management');
};

const goToEarnings = () => {
  router.push('/vendor/earnings');
};
</script>

<style scoped>
.vendor-dashboard-page {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
}

.dashboard-card {
  max-width: 900px;
  width: 100%;
}

.dashboard-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.section-item {
  background-color: var(--color-background-light);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.section-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.section-item h3 {
  color: var(--color-primary-orange);
  margin-bottom: 15px;
}

.section-item p {
  color: var(--color-grey-text);
  margin-bottom: 20px;
}

.order-breakdown {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.badge.pending {
  background-color: #ffc107;
  color: #333;
}

.badge.preparing {
  background-color: #ff6b35;
}

.badge.ready {
  background-color: #4caf50;
}
</style>