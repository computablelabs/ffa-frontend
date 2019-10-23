import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import appStore from '../../../../src/store'
import VueRouter from 'vue-router'
import RouterTabs from '../../../../src/components/ui/RouterTabs.vue'
import ListingsModule from '../../../../src/functionModules/views/ListingsModule'
import RouterTabMapping from '../../../../src/models/RouterTabMapping'
import { FfaListingStatus } from '../../../../src/models/FfaListing'
import { Labels } from '../../../../src/util/Constants'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

describe('RouterTabs.vue', () => {

  const walletAddress = '0xwallet'
  const routerTabMapping: RouterTabMapping[] = ListingsModule.routerTabMapping(walletAddress)

  it('renders the RouterTabs component', () => {
    const wrapper = shallowMount(RouterTabs, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        mapping: routerTabMapping,
        selected: FfaListingStatus.candidate,
      },
    })

    const anchors = wrapper.findAll('li a')
    expect(anchors.length).toBe(3)
    expect(anchors.at(0).text()).toEqual(Labels.ALL)
    expect(anchors.at(1).text()).toEqual(Labels.CANDIDATES)
    expect(anchors.at(2).text()).toEqual(Labels.LISTED)
  })

  it('renders the RouterTabs component', () => {
    const wrapper = mount(RouterTabs, {
      attachToDocument: true,
      store: appStore,
      localVue,
      router,
      propsData: {
        mapping: routerTabMapping,
        selected: FfaListingStatus.candidate,
      },
    })

    const all = wrapper.find(`li[data-tab='${Labels.ALL}'] a`)
    expect(all).toBeDefined()
    expect(wrapper.vm.$route.fullPath.endsWith('/all')).toBeFalsy()
    all.trigger('click')
    expect(wrapper.vm.$route.fullPath.endsWith('/all')).toBeTruthy()

    const candidates = wrapper.find(`li[data-tab='${Labels.CANDIDATES}'] a`)
    expect(candidates).toBeDefined()
    expect(wrapper.vm.$route.fullPath.endsWith('/candidates')).toBeFalsy()
    candidates.trigger('click')
    expect(wrapper.vm.$route.fullPath.endsWith('/candidates')).toBeTruthy()

    const listed = wrapper.find(`li[data-tab='${Labels.LISTED}'] a`)
    expect(listed).toBeDefined()
    expect(wrapper.vm.$route.fullPath.endsWith('/listed')).toBeFalsy()
    listed.trigger('click')
    expect(wrapper.vm.$route.fullPath.endsWith('/listed')).toBeTruthy()

    wrapper.destroy()
  })
})
