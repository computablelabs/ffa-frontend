import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import VueRouter from 'vue-router'
import List from '@/views/List.vue'
import appStore from '../../../src/store'
import AppModule from '../../../src/vuexModules/AppModule'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FileUploader from '@/components/listing/FileUploader.vue'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faPlusSquare)
const listId = 'list'
const fileUploaderClass = 'file-uploader'

describe('List.vue', () => {
  let wrapper: Wrapper<List>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the List view', () => {
    wrapper = mount(List, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`section#${listId}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileUploaderClass}`).length).toBe(1)
  })

  it('renders renders the loader and list vue appropriately', () => {
    wrapper = mount(List, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    const appModule = getModule(AppModule, appStore)

    expect(wrapper.findAll(`section#${listId}`).isVisible()).toBe(false)

    appModule.setMakerPayment(1)
    appModule.setCostPerByte(1)
    appModule.setStake(1)
    appModule.setPriceFloor(1)
    appModule.setPlurality(1)
    appModule.setVoteBy(1)

    expect(wrapper.findAll(`section#${listId}`).isVisible()).toBe(true)
  })
})
