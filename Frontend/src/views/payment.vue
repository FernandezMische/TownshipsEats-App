<template>
  <div class="payment-container">
    <h1>Checkout</h1>
    
    <div v-if="loading" class="text-center">
      <p>Loading your cart...</p>
    </div>
    
    <div v-else>
      <div class="order-summary">
        <h3>Order Summary</h3>
        <div v-if="!cart.items || cart.items.length === 0" class="text-center">
          <p>Your cart is empty. <RouterLink to="/customer/home">Go back shopping</RouterLink></p>
        </div>
        <div v-else>
          <div v-for="item in cart.items" :key="item.id" class="summary-item">
            <span>{{ item.name }} x{{ item.quantity }}</span>
            <span>R{{ (Number(item.unit_price) * Number(item.quantity)).toFixed(2) }}</span>
          </div>
          <div class="address-section">
            <label for="deliveryAddress"><strong>Delivery Address</strong></label>
            <textarea
              id="deliveryAddress"
              v-model.trim="deliveryAddress"
              rows="3"
              placeholder="Enter your delivery address"
            ></textarea>
          </div>
          <div class="summary-line">
            <span>Subtotal:</span>
            <span>R{{ Number(cart.subtotal || 0).toFixed(2) }}</span>
          </div>
          <div class="summary-line">
            <span>Delivery Fee:</span>
            <span>R{{ Number(cart.delivery_fee || 25.00).toFixed(2) }}</span>
          </div>
          <div class="summary-total">
            <strong>Total: R{{ calculateTotal().toFixed(2) }}</strong>
          </div>
        </div>
      </div>
      
      <div v-if="success" class="success">{{ success }}</div>
      <div v-if="error" class="error">{{ error }}</div>

      <button v-if="cart.items && cart.items.length > 0 && !success" @click="completeOrder" :disabled="loading">
        {{ loading ? "Processing..." : `Complete Order - R${calculateTotal().toFixed(2)}` }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { RouterLink } from 'vue-router';

export default {
  name: "PaymentPage",
  data() {
    return {
      loading: true,
      success: null,
      error: null,
      cart: { items: [], subtotal: 0, delivery_fee: 25.00, total: 0 },
      deliveryAddress: ''
    };
  },
  async created() {
    await Promise.all([this.fetchCart(), this.fetchProfileAddress()]);
  },
  methods: {
    submitPayFastForm(url, fields) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value ?? '';
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    },

    async fetchCart() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5401/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          this.cart = response.data.data;
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        this.error = 'Failed to load cart';
      } finally {
        this.loading = false;
      }
    },

    async fetchProfileAddress() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:5401/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.success) {
          const profileAddress = response.data.data?.address || '';
          this.deliveryAddress = profileAddress;

          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem(
            'user',
            JSON.stringify({
              ...currentUser,
              address: profileAddress
            })
          );
        }
      } catch (err) {
        console.error('Error fetching profile address:', err);
      }
    },
    
    calculateTotal() {
      const subtotal = Number(this.cart.subtotal || 0);
      const deliveryFee = Number(this.cart.delivery_fee || 25.00);
      return subtotal + deliveryFee;
    },
    
    async completeOrder() {
      this.loading = true;
      this.error = null;
      this.success = null;

      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token) {
          this.$router.push('/login');
          return;
        }

        if (!user.email) {
          this.error = 'Missing user email. Please log in again.';
          this.loading = false;
          return;
        }

        if (!this.deliveryAddress) {
          this.error = 'Please add a delivery address before checkout.';
          this.loading = false;
          return;
        }

        const orderResponse = await axios.post('http://localhost:5401/api/orders', {
          delivery_address: this.deliveryAddress
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!orderResponse.data?.success) {
          throw new Error('Failed to create order');
        }

        const orderId = orderResponse.data.data?.order_id;
        const orderTotal = Number(orderResponse.data.data?.total || this.calculateTotal());
        const [firstName, ...restName] = String(user.username || 'Customer').trim().split(' ');
        const lastName = restName.join(' ');

        const payfastResponse = await axios.post('http://localhost:5401/api/payfast/pay', {
          first_name: firstName || 'Customer',
          last_name: lastName || '',
          email: user.email,
          amount: orderTotal,
          item_name: `Order #${orderId}`,
          item_description: `Kasi Eats order ${orderId}`,
          order_id: orderId
        });

        if (!payfastResponse.data?.success || !payfastResponse.data?.url || !payfastResponse.data?.data) {
          throw new Error(payfastResponse.data?.error || 'Failed to initiate PayFast');
        }

        this.success = 'Redirecting to PayFast...';
        this.submitPayFastForm(payfastResponse.data.url, payfastResponse.data.data);
      } catch (err) {
        console.error("Order error:", err);
        this.error = `Error: ${err.response?.data?.error || err.message}`;
        this.loading = false;
      } finally {
        if (this.success !== 'Redirecting to PayFast...') {
          this.loading = false;
        }
      }
    },
  },
};
</script>

<style scoped>
.payment-container {
  max-width: 500px;
  margin: 50px auto;
  padding: 30px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: white;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.order-summary {
  text-align: left;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.address-section {
  margin: 15px 0;
}

.address-section label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.address-section textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  resize: vertical;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #ddd;
  text-align: right;
  font-size: 1.2em;
}

button {
  padding: 12px 30px;
  font-size: 16px;
  cursor: pointer;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 20px;
  font-weight: bold;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: #f44336;
  margin-top: 10px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  border: 1px solid #f44336;
}

.success {
  color: #4caf50;
  margin-top: 10px;
  padding: 10px;
  background-color: #e8f5e8;
  border-radius: 4px;
  border: 1px solid #4caf50;
  font-weight: bold;
}

.text-center {
  text-align: center;
}
</style>

