import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import App from '@/App.vue'
import VueRouter from 'vue-router'
import List from '@/views/List.vue'
import { routes, router } from '../../../src/router' // TODO: figure out why @/router doesn't work
import appStore from '../../../src/store'

const localVue = createLocalVue()
localVue.use(VueRouter)

const listRoute = '/list'

describe('App', () => {
  it('renders a child component via routing', () => {
    const wrapper = mount(App, {
      attachToDocument: true,
      localVue,
      router,
      store: appStore,
    })
    router.push(listRoute)
    expect(wrapper.find('section#list').exists()).toBe(true)
  })
})
