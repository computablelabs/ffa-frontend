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
const imageClass = 'image'
const dropzoneClass = 'dropzone'
const textClass = 'text'
const dzMessageClass = 'dz-message'
const defaultImageClass = 'default'
const hoverImageClaass = 'hover'
const helpClass = 'help'

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
    const child = wrapper.findAll(`.${fileUploaderClass} > div`)

    expect(child.at(0).classes()).toContain(imageClass)
    expect(child.at(0).classes()).toContain(dropzoneClass)
    expect(child.at(0).classes()).toContain(defaultImageClass)
    expect(child.at(0).classes()).not.toContain(hoverImageClaass)

    expect(child.at(1).classes()).toContain(textClass)
    expect(child.at(1).classes()).toContain(dzMessageClass)
    expect(child.at(1).find(`p`).text()).toEqual('Drag a file to start')
    expect(child.at(1).find(`a`).text()).toEqual('Learn more about listing')
  })

  it('renders a different image and no text on file dragging', () => {
    wrapper.setData({ isDraggingOver: true })
    expect(wrapper.find(`.${fileUploaderClass} .${imageClass}`).classes()).toContain(hoverImageClaass)
    expect(wrapper.find(`.${fileUploaderClass} .${imageClass}`).classes()).not.toContain(defaultImageClass)
    expect(wrapper.findAll(`.${fileUploaderClass} .${textClass} p`).length).toEqual(0)
    expect(wrapper.findAll(`.${fileUploaderClass} .${textClass} a`).length).toEqual(0)
  })

  // it('renders a different image and no text when file is dropped', () => {

  //   uploadModule.prepare(emptyMp3File)
  //   uploadModule.setStatus(ProcessStatus.Ready)

  //   // These will change when this component displays a different image for the file type
  //   expect(wrapper.find(`.${fileUploaderClass} .${imageClass}`).classes()).toContain(hoverImageClaass)
  //   expect(wrapper.find(`.${fileUploaderClass} .${imageClass}`).classes()).not.toContain(defaultImageClass)
  //   expect(wrapper.findAll(`.${fileUploaderClass} .${textClass} p`).length).toEqual(0)
  //   expect(wrapper.findAll(`.${fileUploaderClass} .${textClass} a`).length).toEqual(0)
  // })

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
