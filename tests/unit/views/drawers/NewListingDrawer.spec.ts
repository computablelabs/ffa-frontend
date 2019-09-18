import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import NewListingDrawer from '@/views/drawers/NewListingDrawer.vue'
import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import DrawerModule, { DrawerState } from '../../../../src/vuexModules/DrawerModule'
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

describe('NewListingDrawer.vue', () => {

  let wrapper!: Wrapper<NewListingDrawer>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
    drawerModule = getModule(DrawerModule, appStore)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the NewListingDrawer view', () => {
    drawerModule.setDrawerState(DrawerState.processing)
    wrapper = mount(NewListingDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`#${listDrawerId}`).length).toBe(1)
    expect(wrapper.findAll(`.${drawerMessageClass}`).length).toBe(1)
    const statusLabels = wrapper.findAll(`#${listDrawerId} .${statusClass}`)
    expect(statusLabels.length).toBe(3)
    expect(statusLabels.at(0).find('.label').text()).toEqual('List')
    expect(statusLabels.at(1).find('.label').text()).toEqual('Upload')
    expect(statusLabels.at(2).findAll('div.label').length).toBe(2)
  })

  it('renders the Start Listing Button', () => {
    drawerModule.setDrawerState(DrawerState.beforeProcessing)
    wrapper = mount(NewListingDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
  })

  // TODO: expand specs to cover changes in validation results of FileMetadata
  it('displays the 3 statuses on Start Listing Button click', () => {
    drawerModule.setDrawerState(DrawerState.beforeProcessing)
    wrapper = mount(NewListingDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    const buttonWrapper = wrapper.find(`.${buttonClass}`)
    buttonWrapper.trigger('click')

    expect(wrapper.findAll(`.${statusClass}`).length).toBe(3)
  })
})
