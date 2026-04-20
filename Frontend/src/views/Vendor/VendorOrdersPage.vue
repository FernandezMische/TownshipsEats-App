<!-- Frontend/src/views/Vendor/VendorOrdersPage.vue -->
<template>
  <div class="vendor-orders-page">
    <div class="page-card orders-card">
      <BackButton class="mb-20">Back to Dashboard</BackButton>
      <h2 class="text-center mb-20">Vendor Orders</h2>
      
      <div v-if="loading" class="text-center">
        <p>Loading orders...</p>
      </div>

      <p v-else-if="orders.length === 0" class="text-center mb-20">No orders received yet.</p>

      <div class="orders-list" v-else>
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-header flex-between">
            <h4>Order #{{ order.order_number || order.id }}</h4>
            <span :class="['order-status', getStatusClass(order.status)]">{{ order.status }}</span>
          </div>
          <div class="order-body">
            <p><strong>Customer:</strong> {{ order.customer_name || order.username || 'Customer' }}</p>
            <p><strong>Total:</strong> R{{ Number(order.total_amount).toFixed(2) }}</p>
            <p><strong>Payment:</strong> {{ order.payment_status }}</p>
            <p><strong>Items:</strong></p>
            <ul>
              <li v-for="item in order.items" :key="item.id">
                {{ item.quantity }}x {{ item.name }} - R{{ Number(item.unit_price).toFixed(2) }} each
              </li>
            </ul>
            <p><strong>Delivery Address:</strong> {{ order.delivery_address }}</p>
            <p><strong>Ordered:</strong> {{ formatDate(order.created_at) }}</p>
          </div>
          <div class="order-actions">
            <PrimaryButton 
              v-if="order.status === 'pending' && order.payment_status === 'paid'" 
              text="Accept Order" 
              type="success" 
              @click="updateOrderStatus(order.id, 'preparing')" 
            />
            <PrimaryButton 
              v-if="order.status === 'preparing'" 
              text="Mark Ready" 
              type="primary" 
              @click="updateOrderStatus(order.id, 'ready')" 
            />
            <p v-if="order.status === 'ready'" class="awaiting-driver-text">
              Waiting for a driver to accept this delivery.
            </p>
            <PrimaryButton 
              v-if="order.status === 'out_for_delivery'" 
              text="Mark Delivered" 
              type="success" 
              @click="updateOrderStatus(order.id, 'delivered')" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import BackButton from '../../components/Shared/BackButton.vue';
import PrimaryButton from '../../components/Shared/PrimaryButton.vue';

const orders = ref([]);
const loading = ref(true);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

const getStatusClass = (status) => {
  return status?.toLowerCase().replace(' ', '-') || 'pending';
};

const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('https://townships-eats-backend.onrender.com/api/vendor/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      orders.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  } finally {
    loading.value = false;
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`https://townships-eats-backend.onrender.com/api/vendor/orders/${orderId}/status`, 
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const order = orders.value.find(o => o.id === orderId);
    if (order) order.status = newStatus;
    
    alert(`Order status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating order:', error);
    alert('Failed to update order status');
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.vendor-orders-page {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  padding: 20px;
  min-height: 100vh;
}

.orders-card {
  max-width: 800px;
  width: 100%;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
}

.order-item {
  background-color: var(--color-background-light);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px;
  text-align: left;
}

.order-header {
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 10px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-header h4 {
  margin: 0;
  color: var(--color-text-dark);
  font-size: 1.2em;
}

.order-status {
  padding: 4px 10px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 0.9em;
  color: white;
}

.order-status.pending { background-color: #ffc107; color: #333; }
.order-status.preparing { background-color: #ff6b35; }
.order-status.ready { background-color: #007bff; }
.order-status.out_for_delivery { background-color: #6f42c1; }
.order-status.delivered { background-color: #4caf50; }

.order-body p {
  margin-bottom: 5px;
  color: var(--color-grey-text);
}

.order-body ul {
  list-style-type: disc;
  margin-left: 20px;
  padding-left: 0;
  color: var(--color-grey-text);
  margin-bottom: 10px;
}

.order-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.awaiting-driver-text {
  color: var(--color-grey-text);
  font-weight: 600;
  margin: 0;
  align-self: center;
}
</style>
