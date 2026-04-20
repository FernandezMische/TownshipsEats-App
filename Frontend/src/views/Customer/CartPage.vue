<!-- Frontend/src/views/Customer/CartPage.vue -->
<template>
  <div class="cart-page">
    <div class="page-card cart-card">
      <h2 class="text-center mb-20">Your Shopping Cart</h2>

      <div v-if="loading" class="text-center">
        <p>Loading your cart...</p>
      </div>

      <div v-else-if="!cartItems || cartItems.length === 0" class="text-center">
        <p>Your cart is empty. <RouterLink to="/customer/home">Start shopping now!</RouterLink></p>
      </div>

      <div v-else>
        <div class="cart-list">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-details">
              <div>
                <h3>{{ item.name || 'Item' }}</h3>
                <p class="item-restaurant">{{ item.vendor_name || 'Vendor' }}</p>
                <div class="quantity-controls">
                  <button @click="decreaseQuantity(item.id)">-</button>
                  <span>{{ item.quantity || 1 }}</span>
                  <button @click="increaseQuantity(item.id)">+</button>
                </div>
              </div>
            </div>
            <div class="item-pricing">
              <span class="item-total-price">R{{ ((item.unit_price || 0) * (item.quantity || 1)).toFixed(2) }}</span>
              <button class="remove-btn" @click="removeFromCart(item.id)">Remove</button>
            </div>
          </div>
        </div>

        <div class="cart-summary mt-40">
          <div class="summary-line">
            <span>Subtotal:</span>
            <span>R{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-line">
            <span>Delivery Fee:</span>
            <span>R{{ Number(deliveryFee).toFixed(2) }}</span>
          </div>
          <div class="summary-line total-line">
            <span>Total:</span>
            <span>R{{ total.toFixed(2) }}</span>
          </div>
          
          <RouterLink to="/payment" class="checkout-btn">
            <button class="btn-primary">Proceed to Checkout (R{{ total.toFixed(2) }})</button>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import axios from 'axios';

const cartItems = ref([]);
const deliveryFee = ref(25.00);
const loading = ref(true);

const fetchCart = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      cartItems.value = [];
      return;
    }

    const response = await axios.get('https://townships-eats-backend.onrender.com/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const cartData = response.data.data;
      cartItems.value = cartData.items || [];
      deliveryFee.value = cartData.delivery_fee || 25.00;
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCart();
});

const subtotal = computed(() => {
  if (!cartItems.value || cartItems.value.length === 0) return 0;
  return cartItems.value.reduce((sum, item) => {
    const price = item.unit_price || 0;
    const qty = item.quantity || 1;
    return sum + (price * qty);
  }, 0);
});

const total = computed(() => {
  const sub = subtotal.value || 0;
  const fee = Number(deliveryFee.value) || 25.00;
  return sub + fee;
});

const increaseQuantity = async (id) => {
  const item = cartItems.value.find(i => i.id === id);
  if (item) {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://townships-eats-backend.onrender.com/api/cart/item/${id}`, 
        { quantity: (item.quantity || 1) + 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      item.quantity = (item.quantity || 1) + 1;
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }
};

const decreaseQuantity = async (id) => {
  const item = cartItems.value.find(i => i.id === id);
  if (item) {
    const currentQty = item.quantity || 1;
    if (currentQty > 1) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`https://townships-eats-backend.onrender.com/api/cart/item/${id}`, 
          { quantity: currentQty - 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        item.quantity = currentQty - 1;
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      await removeFromCart(id);
    }
  }
};

const removeFromCart = async (id) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`https://townships-eats-backend.onrender.com/api/cart/item/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    cartItems.value = cartItems.value.filter(item => item.id !== id);
  } catch (error) {
    console.error('Error removing item:', error);
  }
};
</script>

<style scoped>
.cart-page {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #fff5ec, #ffe8d6);
  padding: 20px;
  min-height: 100vh;
}

.cart-card {
  max-width: 700px;
  width: 100%;
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.cart-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eee;
}

.item-details h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.item-restaurant {
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: #666;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-controls button {
  background-color: #ddd;
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 1.1em;
}

.quantity-controls button:hover {
  background-color: #ccc;
}

.item-pricing {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.item-total-price {
  font-weight: bold;
  color: #ff6b35;
  font-size: 1.2em;
}

.remove-btn {
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

.remove-btn:hover {
  background-color: #cc0000;
}

.cart-summary {
  border-top: 1px solid #ddd;
  padding-top: 20px;
  margin-top: 30px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.total-line {
  font-size: 1.3em;
  font-weight: bold;
  color: #ff6b35;
  border-top: 1px dashed #ddd;
  padding-top: 15px;
  margin-top: 15px;
}

.checkout-btn {
  text-decoration: none;
  display: block;
  margin-top: 20px;
}

.btn-primary {
  width: 100%;
  padding: 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #45a049;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-40 {
  margin-top: 40px;
}

.text-center {
  text-align: center;
}
</style>