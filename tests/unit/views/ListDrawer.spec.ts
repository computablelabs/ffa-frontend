import { mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import ListDrawer from '@/views/ListDrawer.vue'
import appStore from '../../../src/store'
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

describe('ListDrawer.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  it('renders the ListDrawer view', () => {
    const wrapper = mount(ListDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`.${listDrawerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${statusClass}`).length).toBe(3)
  })

  it('renders the Start Listing Button', () => {
    const wrapper = mount(ListDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
  })

  it('displays the upload button on Start Listing Button click', () => {
    const wrapper = mount(ListDrawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    const buttonWrapper = wrapper.find(`${buttonClass}`)
    buttonWrapper.trigger('click')
    expect(wrapper.findAll(`.${buttonContainerClass}`).length).toBe(1)
    const buttonContainer = wrapper.find(`.${buttonContainerClass}`).element as HTMLDivElement
    expect(buttonContainer.style.getPropertyValue('display')).toEqual('none')
    const statusLabels = wrapper.findAll(`.${listDrawerClass} .${statusClass} .${labelTextClass}`)
    expect(statusLabels.length).toBe(3)
    // ensure the correct order
    expect(statusLabels.at(0).text()).toEqual('List')
    expect(statusLabels.at(1).text()).toEqual('Upload')
    expect(statusLabels.at(2).text()).toEqual('Vote')
  })
})
