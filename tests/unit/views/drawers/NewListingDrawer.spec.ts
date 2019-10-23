import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import DrawerModule, { DrawerState } from '../../../../src/vuexModules/DrawerModule'
import NewListingModule from '../../../../src/vuexModules/DrawerModule'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'

import NewListingDrawer from '@/views/drawers/NewListingDrawer.vue'

import FileUploader from '@/components/listing/FileUploader.vue'

const localVue = createLocalVue()

let drawerModule!: DrawerModule
let newListingModule!: NewListingModule

describe('NewListingDrawer.vue', () => {

  let wrapper!: Wrapper<NewListingDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    drawerModule = getModule(DrawerModule, appStore)
    newListingModule = getModule(NewListingModule, appStore)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders empty before DrawerState is set to processing', () => {
    wrapper = mount(NewListingDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll({ name: 'NewListingProcess' }).length).toBe(0)
  })

  it('renders the NewListingProcess component', () => {
    wrapper = mount(NewListingDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    drawerModule.setDrawerState(DrawerState.processing)
    expect(wrapper.findAll({ name: 'NewListingProcess' }).length).toBe(1)
    expect(newListingModule.status).toBe(ProcessStatus.Ready)
  })
})
