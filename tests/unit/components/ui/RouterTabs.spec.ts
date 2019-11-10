import { shallowMount, createLocalVue, mount, Wrapper } from '@vue/test-utils'
import appStore from '../../../../src/store'
import VueRouter from 'vue-router'
import { router } from '../../../../src/router'
import RouterTabs from '../../../../src/components/ui/RouterTabs.vue'
import ListingsModule from '../../../../src/functionModules/views/ListingsModule'
import RouterTabMapping from '../../../../src/models/RouterTabMapping'
import { FfaListingStatus } from '../../../../src/models/FfaListing'
import { Labels } from '../../../../src/util/Constants'

const localVue = createLocalVue()
localVue.use(VueRouter)

describe('RouterTabs.vue', () => {

  const walletAddress = '0xwallet'
  const routerTabMapping: RouterTabMapping[] = ListingsModule.routerTabMapping(walletAddress)

  let wrapper!: Wrapper<RouterTabs>

  afterAll(() => {
    wrapper.destroy()
  })

  it('renders the RouterTabs component', () => {
    wrapper = shallowMount(RouterTabs, {
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
    wrapper = mount(RouterTabs, {
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
    const candidates = wrapper.find(`li[data-tab='${Labels.CANDIDATES}'] a`)
    expect(candidates).toBeDefined()
    const listed = wrapper.find(`li[data-tab='${Labels.LISTED}'] a`)
    expect(listed).toBeDefined()

    expect(wrapper.vm.$router.currentRoute.fullPath.endsWith('/candidates')).toBeFalsy()
    candidates.trigger('click')
    expect(wrapper.vm.$router.currentRoute.fullPath.endsWith('/candidates')).toBeTruthy()
    expect(wrapper.emitted('close-drawer'))

    expect(wrapper.vm.$router.currentRoute.fullPath.endsWith('/listed')).toBeFalsy()
    listed.trigger('click')
    expect(wrapper.vm.$router.currentRoute.fullPath.endsWith('/listed')).toBeTruthy()

    expect(wrapper.vm.$router.currentRoute.fullPath.endsWith('/all')).toBeFalsy()
    all.trigger('click')
    expect(wrapper.vm.$router.currentRoute.fullPath.endsWith('/all')).toBeTruthy()
  })
})
