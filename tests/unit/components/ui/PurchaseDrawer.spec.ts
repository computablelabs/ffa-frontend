import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'

import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'
import DrawerModule from '../../../../src/vuexModules/DrawerModule'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'

import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'

import AppModule from '../../../../src/vuexModules/AppModule'

import { Errors } from '../../../../src/util/Constants'

import PurchaseDrawer from '@/views/drawers/PurchaseDrawer.vue'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'

const localVue = createLocalVue()
localVue.use(VueRouter)
const drawerOpenClass = 'open'

const drawerModule = getModule(DrawerModule, appStore)
let appModule = getModule(AppModule, appStore)
let ffaListingsModule = getModule(FfaListingsModule, appStore)
let purchaseModule = getModule(PurchaseModule, appStore)

let wrapper!: Wrapper<PurchaseDrawer>

const ffaListing = new FfaListing(
  'title',
  'description',
  'type',
  'hash',
  'md5',
  'license',
  0,
  '0xwallet',
  ['foo', 'bar'],
  FfaListingStatus.listed,
  0,
  0,
)

describe('BaseDrawer.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    drawerModule.setDrawerOpenClass(drawerOpenClass)

    appModule = getModule(AppModule, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)
    purchaseModule = getModule(PurchaseModule, appStore)
  })

  afterAll(() => { wrapper.destroy() })

  describe('rendering', () => {
    it('renders correctly', () => {
      wrapper = shallowMount(PurchaseDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      expect(wrapper.find('purchaseprocess-stub').exists()).toBeTruthy()
    })
  })

  describe('computed properties', () => {
    it('computes errorMessage and listing correctly', () => {
      wrapper = shallowMount(PurchaseDrawer, {
        attachToDocument: true,
        store: appStore,
        localVue,
      })

      appModule.setAppReady(false)
      let errorMessage = getErrorMessage(wrapper)
      expect(errorMessage).toBe(Errors.METAMASK_NOT_CONNECTED)

      appModule.setAppReady(true)
      errorMessage = getErrorMessage(wrapper)
      expect(errorMessage).toBe(Errors.INVALID_LISTING_HASH)

      // @ts-ignore
      expect(wrapper.vm.listing).toBeUndefined()

      wrapper.setProps({ listingHash: 'hash' })
      ffaListingsModule.setListed([ffaListing])

      // @ts-ignore
      expect(wrapper.vm.listing).toBe(ffaListing)
    })

    it('computes isExecuting correctly', () => {
      purchaseModule.setStatus(ProcessStatus.Error)

      // @ts-ignore
      expect(wrapper.vm.isExecuting).toBe(false)

      purchaseModule.setStatus(ProcessStatus.Executing)
      // @ts-ignore
      expect(wrapper.vm.isExecuting).toBe(true)
    })
  })
})

function getErrorMessage(wrapper: Wrapper<PurchaseDrawer>): string {
  // @ts-ignore
  return wrapper.vm.errorMessage
}
