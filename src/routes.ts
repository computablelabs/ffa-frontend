import Home from '@/views/Home.vue'
import List from '@/views/List.vue'
import Listing from '../src/views/Listing.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/listed',
    name: 'list',
    // route level code-splitting
    // this generates a separate chunk (upload.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: List,
  },
  {
    path: '/listing',
    name: 'listing',
    component: Listing,
  },
]
export default routes

