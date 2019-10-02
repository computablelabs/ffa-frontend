import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import NewListingDrawer from '@/views/drawers/NewListingDrawer.vue'
import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import DrawerModule, { DrawerState } from '../../../../src/vuexModules/DrawerModule'
import NewListingModule from '../../../../src/vuexModules/DrawerModule'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FileUploader from '@/components/listing/FileUploader.vue'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle)
const listDrawerId = 'list-drawer'
const statusClass = 'status'
const labelTextClass = 'label-text'
const buttonClass = 'button'
const buttonContainerClass = 'button-container'
const drawerMessageClass = 'drawer-message'

let drawerModule!: DrawerModule
let newListingModule!: NewListingModule

describe('NewListingDrawer.vue', () => {

  let wrapper!: Wrapper<NewListingDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
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
