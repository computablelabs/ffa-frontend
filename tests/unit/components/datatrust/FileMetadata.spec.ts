import Vuex from 'vuex'
import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import FileMetadata from '@/components/datatrust/FileMetadata.vue'
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
const inputClass = 'input'
const titleClass = 'file-title'
const descriptionClass = 'file-description'

describe('FileMetadata.vue', () => {

  const uploadLabels: ProcessStatusLabelMap = {}
  uploadLabels[ProcessStatus.NotReady] = 'Upload'
  uploadLabels[ProcessStatus.Ready] = 'Upload'
  uploadLabels[ProcessStatus.Executing] = 'Uploading...'
  uploadLabels[ProcessStatus.Complete] = 'Upload complete.'
  uploadLabels[ProcessStatus.Error] = 'Upload failure'

  const filename = 'Empty.mp3'
  const emptyBlob = new Array<Blob>()
  const emptyMp3File = new File(emptyBlob, filename, { type: 'audio/mp3' })

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
    expect(wrapper.findAll(`.${fileMetadataClass} form .${fieldClass}`).length).toBe(2)
    expect(wrapper.findAll(`.${fileMetadataClass} form .${fieldClass} .${controlClass}`).length).toBe(2)
    expect(wrapper.findAll(`.${fileMetadataClass} .${controlClass} input`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass} .${controlClass} textarea`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass} .${controlClass} .${titleClass}`).length).toBe(1)
    expect(wrapper.find(`.${fileMetadataClass} .${controlClass} .${titleClass}`).text()).toEqual('')
    expect(wrapper.findAll(`.${fileMetadataClass} .${controlClass} .${descriptionClass}`).length).toBe(1)
    expect(wrapper.find(`.${fileMetadataClass} .${controlClass} .${descriptionClass}`).text()).toEqual('')
  })

  it('sets the title to the filename when file is dropped', () => {
    uploadModule.prepare(emptyMp3File)
    uploadModule.setStatus(ProcessStatus.Ready)
    const selector = `.${fileMetadataClass} .${controlClass} .${titleClass}`
    const titleField = wrapper.find(selector).element as HTMLInputElement
    expect(titleField.value).toEqual(filename)
  })

  it('records changes to the title to module', () => {
    const selector = `.${fileMetadataClass} .${controlClass} .${titleClass}`
    const titleField = wrapper.find(selector).element as HTMLInputElement
    titleField.value = 'asdf'
    wrapper.find(selector).trigger('input')
    expect(uploadModule.title).toEqual('asdf')
  })
})
