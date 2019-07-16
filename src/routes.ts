import Home from '@/views/Home.vue'
import List from '@/views/List.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/list',
    name: 'list',
    // route level code-splitting
    // this generates a separate chunk (upload.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: List,
  },
]
export default routes

