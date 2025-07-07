import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CarsView from '../views/CarsView.vue'
import CarDetail from '../views/CarDetail.vue'
import ConfiguratorView from '../views/configurator.vue'
import confcar from '../views/confcar.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/confcar',
      name: 'confcar',
      component: confcar,
    },
    {
      path: '/configurator',
      name: 'configurator',
      component: ConfiguratorView,
    },
     {
      path: '/cars',
      name: 'cars',
      component: CarsView,
    },
     {
      path: '/car/:id',
      name: 'car',
      component: CarDetail,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
