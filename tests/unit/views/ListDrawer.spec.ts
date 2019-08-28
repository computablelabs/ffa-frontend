import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import ListDrawer from '@/views/drawers/ListDrawer.vue'
import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import DrawerModule, { DrawerState } from '../../../src/vuexModules/DrawerModule'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FileUploader from '@/components/listing/FileUploader.vue'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle)
const listDrawerClass = 'list-drawer'
const statusClass = 'status'
const labelTextClass = 'label-text'
const buttonClass = 'button'
const buttonContainerClass = 'button-container'

let drawerModule!: DrawerModule

describe('ListDrawer.vue', () => {

  let wrapper!: Wrapper<ListDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    drawerModule = getModule(DrawerModule, appStore)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the ListDrawer view', () => {
    drawerModule.setDrawerState(DrawerState.processing)
    wrapper = mount(ListDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`.${listDrawerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${statusClass}`).length).toBe(3)
  })

  it('renders the Start Listing Button', () => {
    drawerModule.setDrawerState(DrawerState.beforeProcessing)
    wrapper = mount(ListDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
  })

  // TODO: expand specs to cover changes in validation results of FileMetadata
  it('displays the upload button on Start Listing Button click', () => {
    drawerModule.setDrawerState(DrawerState.beforeProcessing)
    wrapper = mount(ListDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    const buttonWrapper = wrapper.find(`${buttonClass}`)
    buttonWrapper.trigger('click')
    expect(wrapper.findAll(`.${statusClass} .${buttonClass}`).length).toBe(1)
    const buttonContainer = wrapper.find(`.${buttonContainerClass}`).element as HTMLDivElement
    const statusLabels = wrapper.findAll(`.${listDrawerClass} .${statusClass} .${labelTextClass}`)
    expect(statusLabels.length).toBe(2)
    // ensure the correct order
    expect(statusLabels.at(0).text()).toEqual('Upload')
    expect(statusLabels.at(1).text()).toEqual('Vote')
  })
})
