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
      console.log('🔍 Проверка перед входом в систему...');
      if (isAuthenticated()) {
        console.log('🟢 Пользователь уже авторизован, перенаправляем в кабинет.');
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
  history: createWebHistory(),
  routes,
});

// Проверка токена
function isAuthenticated() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.log('🔴 Нет accessToken в localStorage');
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp > now) {
      console.log('🟢 Токен действителен');
      return true;
    } else {
      console.warn('🟠 Токен истек');
      localStorage.removeItem('accessToken'); // Удаляем просроченный токен
      return false;
    }
  } catch (error) {
    console.error('🔴 Ошибка при декодировании токена:', error);
    return false;
  }
}

// Глобальный перехватчик маршрутов
router.beforeEach((to, from, next) => {
  console.log(`🚀 Навигация: ${from.path} → ${to.path}`);

  if (to.meta.requiresAuth) {
    if (!isAuthenticated()) {
      console.warn('🔴 Пользователь не авторизован. Перенаправляем на страницу входа.');
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
