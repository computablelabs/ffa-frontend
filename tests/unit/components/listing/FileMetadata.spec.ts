import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { getModule } from 'vuex-module-decorators'

import appStore from '../../../../src/store'
import UploadModule from '../../../../src/vuexModules/UploadModule'
import AppModule from '../../../../src/vuexModules/AppModule'
import DrawerModule, { DrawerState } from '../../../../src/vuexModules/DrawerModule'
import NewListingModule from '../../../../src/vuexModules/NewListingModule'

import FileMetadata from '@/components/listing/FileMetadata.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../../../src/models/ProcessStatus'

import Web3 from 'web3'

const localVue = createLocalVue()
const fileMetadataClass = 'file-metadata'
const fieldClass = 'field'
const controlClass = 'control'
const descriptionClass = 'description-field'
const titleFieldInputClass = '.title-field'

describe('FileMetadata.vue', () => {

  const web3 = new Web3('http://localhost:8545')
  let appModule!: AppModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3(web3)
  })

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
    uploadModule = getModule(UploadModule, appStore)
  })

  beforeEach(() => {
    wrapper = mount(FileMetadata, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the FileMetadata component', () => {
    expect(wrapper.findAll(`.${fileMetadataClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass} form`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass} .${controlClass} textarea`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass} .${controlClass} .${descriptionClass}`).length).toBe(1)
    expect(wrapper.find(`.${fileMetadataClass} .${controlClass} .${descriptionClass}`).text()).toEqual('')
  })

  it('updates the title field when the module changes', () => {
    expect(wrapper.vm.$data.title).toEqual('')
    uploadModule.setTitle('foo')
    expect(wrapper.vm.$data.title).toEqual('foo')
  })

  it('updates DataModule', () => {
    const drawerModule = getModule(DrawerModule, appStore)
    const newListingModule = getModule(NewListingModule, appStore)

    wrapper.setData({title: 'title'})
    expect(newListingModule.status).toEqual(ProcessStatus.NotReady)
    expect(drawerModule.status).toEqual(DrawerState.beforeProcessing)
    wrapper.setData({description: 'description'})
    expect(newListingModule.status).toEqual(ProcessStatus.Ready)
    expect(drawerModule.status).toEqual(DrawerState.beforeProcessing)
  })

  it('sets title & description editability in response to appropriate setStatus() UploadModule mutation', () => {
    wrapper = mount(FileMetadata, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    uploadModule.setStatus(ProcessStatus.Complete)
    const titleFieldInput = wrapper.find(titleFieldInputClass).find('input')
    const descriptionFieldInput = wrapper.find(`.${descriptionClass}`)

    expect(titleFieldInput.attributes().disabled).toBe('disabled')
    expect(descriptionFieldInput.attributes().disabled).toBe('disabled')

    uploadModule.setStatus(ProcessStatus.Ready)
    expect(titleFieldInput.attributes().disabled).toBeUndefined()
    expect(descriptionFieldInput.attributes().disabled).toBeUndefined()
  })

  it('renders disabled if viewOnly prop is given and true', () => {
    wrapper = mount(FileMetadata, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        viewOnly: true,
      },
    })

    const titleFieldInput = wrapper.find(titleFieldInputClass).find('input')
    const descriptionFieldInput = wrapper.find(`.${descriptionClass}`)

    expect(titleFieldInput.attributes().disabled).toBe('disabled')
    expect(descriptionFieldInput.attributes().disabled).toBe('disabled')
  })

  it('renders enabled if viewOnly prop is not given', () => {
    wrapper = mount(FileMetadata, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    const titleFieldInput = wrapper.find(titleFieldInputClass)
    const descriptionFieldInput = wrapper.find(`.${descriptionClass}`)

    expect(titleFieldInput.attributes().disabled).toBeUndefined()
    expect(descriptionFieldInput.attributes().disabled).toBeUndefined()
  })

  it('behaves reactively to viewOnly prop changes', () => {
    wrapper = mount(FileMetadata, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        viewOnly: true,
      },
    })
    const titleFieldInput = wrapper.find(titleFieldInputClass).find('input')
    const descriptionFieldInput = wrapper.find(`.${descriptionClass}`)

    expect(titleFieldInput.attributes().disabled).toBe('disabled')
    expect(descriptionFieldInput.attributes().disabled).toBe('disabled')

    wrapper.setProps({ viewOnly: false})

    expect(titleFieldInput.attributes().disabled).toBeUndefined()
    expect(descriptionFieldInput.attributes().disabled).toBeUndefined()
  })

  it('reacts correctly to upload module mutations', () => {
    wrapper = mount(FileMetadata, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.vm.$data.fileSize).toBe(0)
    uploadModule.setSize(1000)
    expect(wrapper.vm.$data.fileSize).toBe(1000)

  })
})
