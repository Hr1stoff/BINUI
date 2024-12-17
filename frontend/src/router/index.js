import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Cabinet from '@/views/Cabinet.vue';
import { jwtDecode } from 'jwt-decode';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    beforeEnter: (to, from, next) => {
      if (isAuthenticated()) {

        next('/cabinet');
      } else {
        next();
      }
    },
  },
  {
    path: '/cabinet',
    name: 'Cabinet',
    component: Cabinet,
    meta: { requiresAuth: true },
  },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Проверка токена
function isAuthenticated() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.log('Токен отсутствует');
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    return false;
  }
}

router.beforeEach((to, from, next) => {

  if (to.meta.requiresAuth) {
    if (!isAuthenticated()) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
