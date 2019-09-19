import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { getModule } from 'vuex-module-decorators'

import appStore from '../../../../src/store'
import UploadModule from '../../../../src/vuexModules/UploadModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import AppModule from '../../../../src/vuexModules/AppModule'

import FileUploader from '@/components/listing/FileUploader.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../../../src/models/ProcessStatus'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid, faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import Web3 from 'web3'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faHeadphonesAlt)
const fileUploaderClass = 'file-uploader'
const componentClass = 'component'
const dropzoneTextFrameClass = 'dropzone-text-frame'
const dropzoneTextClass = 'dropzone-text'
const dropzoneClass = 'dropzone'
const clickDisabledClass = 'click-disabled'

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
  })

  beforeEach(() => {
    wrapper = shallowMount(FileUploader, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the FileUploader component', () => {
    expect(wrapper.findAll(`.${fileUploaderClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileUploaderClass} .${componentClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileUploaderClass} .${componentClass} font-awesome-icon-stub`).length).toBe(2)
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

  it('kicks off file upload', () => {
    const web3 = new Web3('http://localhost:8545')
    const web3Module = getModule(Web3Module, appStore)
    web3Module.initialize(web3)

    uploadModule.setTitle('title')
    uploadModule.setStatus(ProcessStatus.Executing)
    const selector =
      `.${fileUploaderClass} .${componentClass} .${dropzoneTextFrameClass} .${dropzoneTextClass}`
    expect(wrapper.find(selector).text()).toEqual(uploadLabels[ProcessStatus.Executing])
  })

  it('reacts properly to changing props', () => {
    const appModule = getModule(AppModule, appStore)
    wrapper.destroy()
    wrapper = mount(FileUploader, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: { viewOnly: true },
    })
    appModule.setAppReady(true)
    expect(wrapper.findAll(`.${clickDisabledClass}`).length).toBe(1)
    wrapper.setProps({viewOnly: false})
    expect(wrapper.findAll(`.${clickDisabledClass}`).length).toBe(0)
  })
})
