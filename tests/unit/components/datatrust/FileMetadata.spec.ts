import Vuex from 'vuex'
import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import FileMetadata from '@/components/listing/FileMetadata.vue'
import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import UploadModule from '../../../../src/modules/UploadModule'
import { ProcessStatus, ProcessStatusLabelMap } from '../../../../src/models/ProcessStatus'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle)
const fileMetadataClass = 'file-metadata'
const fieldClass = 'field'
const controlClass = 'control'
const descriptionClass = 'file-description'

describe('FileMetadata.vue', () => {

  const uploadLabels: ProcessStatusLabelMap = {}
  uploadLabels[ProcessStatus.NotReady] = 'Upload'
  uploadLabels[ProcessStatus.Ready] = 'Upload'
  uploadLabels[ProcessStatus.Executing] = 'Uploading'
  uploadLabels[ProcessStatus.Complete] = 'Upload complete.'
  uploadLabels[ProcessStatus.Error] = 'Upload failure'

  let uploadModule!: UploadModule
  let wrapper!: Wrapper<FileMetadata>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileMetadata', FileMetadata)
    localVue.component('font-awesome-icon', FontAwesomeIcon)

    uploadModule = getModule(UploadModule, appStore)

    wrapper = shallowMount(FileMetadata, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        vuexModule: uploadModule,
        statusLabels: uploadLabels,
      },
    })
  })

  it('renders the FileMetadata component', () => {
    expect(wrapper.findAll(`.${fileMetadataClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass} form text-field-stub`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass} form .${fieldClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass} form .${fieldClass} .${controlClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass} .${controlClass} input`).length).toBe(0)
    expect(wrapper.findAll(`.${fileMetadataClass} .${controlClass} textarea`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass} .${controlClass} .${descriptionClass}`).length).toBe(1)
    expect(wrapper.find(`.${fileMetadataClass} .${controlClass} .${descriptionClass}`).text()).toEqual('')
  })
})
