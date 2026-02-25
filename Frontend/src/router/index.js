// Frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// --- Auth Pages ---
import LoginPage from '../views/Auth/LoginPage.vue';
import RegistrationPage from '../views/Auth/RegistrationPage.vue';

// --- Customer Pages ---
import CustomerHomePage from '../views/Customer/CustomerHomePage.vue';
import CategoryPage from '../views/Customer/CategoryPage.vue';
import CategoryDishesPage from '../views/Customer/CategoryDishesPage.vue'; // NEW
import CustomerProfilePage from '../views/Customer/CustomerProfilePage.vue';
import FavoritesPage from '../views/Customer/FavoritesPage.vue';
import SearchResultsPage from '../views/Customer/SearchResultsPage.vue';
import VendorDetailPage from '../views/Customer/VendorDetailPage.vue';
import CartPage from '../views/Customer/CartPage.vue';
import OrderTrackingPage from '../views/Customer/OrderTrackingPage.vue';

// --- Vendor Pages ---
import VendorDashboardPage from '../views/Vendor/VendorDashboardPage.vue';
import VendorOrdersPage from '../views/Vendor/VendorOrdersPage.vue'; // NEW
import MenuManagementPage from '../views/Vendor/MenuManagementPage.vue';
import DishFormPage from '../views/Vendor/DishFormPage.vue'; // NEW
import VendorReportsPage from '../views/Vendor/VendorReportsPage.vue'; // NEW
import VendorEarningsPage from '../views/Vendor/VendorEarningsPage.vue';

// --- Driver Pages ---
import DriverDashboardPage from '../views/Driver/DriverDashboardPage.vue';
import payment from  '../views/payment.vue';
// --- Static Pages ---
import AboutUsPage from '../views/Static/AboutUsPage.vue';
import ContactPage from '../views/Static/ContactPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login', // Default redirect
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
    },
    {
      path: '/register',
      name: 'Register',
      component: RegistrationPage,
    },
    // --- Customer Routes ---
    {
path: '/payment',
name: 'Payment',
component: payment,
    },
    {
      path: '/customer',
      redirect: '/customer/home',
      children: [
        {
          path: 'home',
          name: 'CustomerHome',
          component: CustomerHomePage,
        },
        {
          path: 'categories',
          name: 'Categories',
          component: CategoryPage,
        },
        {
          path: 'categories/:id/dishes', // NEW: Dishes within a specific category
          name: 'CategoryDishes',
          component: CategoryDishesPage,
          props: true,
        },
        {
          path: 'profile',
          name: 'CustomerProfile',
          component: CustomerProfilePage,
        },
        {
          path: 'favorites',
          name: 'Favorites',
          component: FavoritesPage,
        },
        {
          path: 'search-results',
          name: 'SearchResults',
          component: SearchResultsPage,
        },
        {
          path: 'vendor/:id',
          name: 'VendorDetail',
          component: VendorDetailPage,
          props: true,
        },
        {
          path: 'cart',
          name: 'Cart',
          component: CartPage,
        },
        {
          path: 'order-tracking/:id',
          name: 'OrderTracking',
          component: OrderTrackingPage,
          props: true,
        },
      ],
    },
    // --- Vendor Routes ---
    {
      path: '/vendor',
      redirect: '/vendor/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'VendorDashboard',
          component: VendorDashboardPage,
        },
        {
          path: 'orders', // NEW
          name: 'VendorOrders',
          component: VendorOrdersPage,
        },
        {
          path: 'menu-management',
          name: 'MenuManagement',
          component: MenuManagementPage,
        },
        {
          path: 'menu-management/add-dish', // NEW: Add a new dish
          name: 'AddDish',
          component: DishFormPage,
        },
        {
          path: 'menu-management/edit-dish/:id', // NEW: Edit an existing dish
          name: 'EditDish',
          component: DishFormPage,
          props: true,
        },
        {
          path: 'reports', // NEW
          name: 'VendorReports',
          component: VendorReportsPage,
        },
        {
          path: 'earnings',
          name: 'VendorEarnings',
          component: VendorEarningsPage,
        },
      ],
    },
    // --- Driver Routes ---
    {
      path: '/driver',
      redirect: '/driver/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'DriverDashboard',
          component: DriverDashboardPage,
        },
      ],
    },
    // --- Static Content Routes ---
    {
      path: '/about',
      name: 'AboutUs',
      component: AboutUsPage,
    },
    {
      path: '/contact',
      name: 'Contact',
      component: ContactPage,
    },
    // Fallback for any unmatched routes
    {
      path: '/:catchAll(.*)',
      redirect: '/login', // Or a 404 page
    }
  ],
});

export default router;
