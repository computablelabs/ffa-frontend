import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import List from '@/views/List.vue'

Vue.use(Router)

export const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/list',
    name: 'lst',
    // route level code-splitting
    // this generates a separate chunk (upload.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: List,
    // left here for posterity
    // component: () => import(/* webpackChunkName: "upload" */ './views/List.vue'),
  },
]

export const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})
