import Vuex from 'vuex'
import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import FileUploader from '@/components/datatrust/FileUploader.vue'
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
const fileUploaderClass = 'file-uploader'
const componentClass = 'component'
const dropzoneTextFrameClass = 'dropzone-text-frame'
const dropzoneTextClass = 'dropzone-text'
const dropzoneClass = 'dropzone'
const buttonClass = 'button'

describe('FileUploader.vue', () => {

  const uploadLabels: ProcessStatusLabelMap = {}
  uploadLabels[ProcessStatus.NotReady] = 'Upload'
  uploadLabels[ProcessStatus.Ready] = 'Upload'
  uploadLabels[ProcessStatus.Executing] = 'Uploading'
  uploadLabels[ProcessStatus.Complete] = 'Upload complete.'
  uploadLabels[ProcessStatus.Error] = 'Upload failure'

  const emptyBlob = new Array<Blob>()
  const emptyMp3File = new File(emptyBlob, 'Empty.mp3', { type: 'audio/mp3' })

  let uploadModule!: UploadModule
  let wrapper!: Wrapper<FileUploader>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)

    uploadModule = getModule(UploadModule, appStore)

    wrapper = shallowMount(FileUploader, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        vuexModule: uploadModule,
        statusLabels: uploadLabels,
      },
    })
  })

  it('renders the FileUploader component', () => {
    expect(wrapper.findAll(`.${fileUploaderClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileUploaderClass} .${componentClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileUploaderClass} .${componentClass} font-awesome-icon-stub`).length).toBe(1)
    expect(wrapper.findAll(`.${fileUploaderClass} .${componentClass} .${dropzoneTextFrameClass}`).length)
      .toBe(1)
    const selector =
      `.${fileUploaderClass} .${componentClass} .${dropzoneTextFrameClass} .${dropzoneTextClass}`
    expect(wrapper.findAll(selector).length).toBe(1)
    expect(wrapper.find(selector).text()).toEqual('Drop a file')
    expect(wrapper.findAll(`.${fileUploaderClass} .${componentClass} .${dropzoneClass}`).length)
      .toBe(1)
  })

  it('renders the file size and icon when file is dropped', () => {
    uploadModule.prepare(emptyMp3File)
    uploadModule.setStatus(ProcessStatus.Ready)
    const selector =
      `.${fileUploaderClass} .${componentClass} .${dropzoneTextFrameClass} .${dropzoneTextClass}`
    expect(wrapper.find(selector).text()).toEqual('0 bytes')
  })

  it('uploads the file', () => {
    uploadModule.setStatus(ProcessStatus.Executing)
    const selector =
      `.${fileUploaderClass} .${componentClass} .${dropzoneTextFrameClass} .${dropzoneTextClass}`
    expect(wrapper.find(selector).text()).toEqual(uploadLabels[ProcessStatus.Executing])
  })
})
