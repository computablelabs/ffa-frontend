import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../src/store'
import UploadModule from '../../../src/vuexModules/UploadModule'
import DrawerModule, { DrawerState } from '../../../src/vuexModules/DrawerModule'
import NewListingModule from '../../../src/vuexModules/NewListingModule'
import AppModule from '../../../src/vuexModules/AppModule'

import { ProcessStatus } from '../../../src/models/ProcessStatus'

import CreateNewListing from '@/views/CreateNewListing.vue'
import FileUploader from '@/components/listing/FileUploader.vue'

import MetamaskModule from '../../../src/functionModules/metamask/MetamaskModule'

import Servers from '../../../src/util/Servers'

import web3 from 'web3'

const localVue = createLocalVue()
const createNewListingId = 'create-new-listing'
const ethereumLoaderId = 'ethereum-loader'
const fileUploaderClass = 'file-uploader'
const fileMetadataComponentName = 'FileMetadata'
const buttonClass = 'button'

const emptyBlob = new Array<Blob>()
const emptyMp3File = new File(emptyBlob, 'Empty.mp3', { type: 'audio/mp3' })

let appModule!: AppModule

describe('CreateNewListing.vue', () => {

  const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'

  const w3 = new web3(Servers.SkynetJsonRpc)
  const gethProvider = w3.currentProvider

  let wrapper: Wrapper<CreateNewListing>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)

    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3(Servers.SkynetJsonRpc)

    MetamaskModule.enable = (): Promise<string|Error> => {
      return Promise.resolve('foo')
    }
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the CreateNewListing view', () => {
    wrapper = mount(CreateNewListing, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`section#${createNewListingId}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileUploaderClass}`).length).toBe(1)
  })

  it('renders renders the loader', () => {
    appModule.disconnectWeb3()
    wrapper = mount(CreateNewListing, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        requiresMetamask: true,
      },
    })
    console.log(wrapper.html())
    expect(wrapper.findAll(`#${ethereumLoaderId}`).length).toBe(1)
    appModule.initializeWeb3(Servers.SkynetJsonRpc)
  })

  it('renders renders the page', () => {
    wrapper = mount(CreateNewListing, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        requiresMetamask: true,
      },
    })
    expect(wrapper.findAll(`#${ethereumLoaderId}`).length).toBe(0)
    expect(wrapper.findAll(`.${fileUploaderClass}`).length).toBe(1)
    expect(wrapper.findAll({ name: fileMetadataComponentName }).length).toBe(0)

    appModule.disconnectWeb3()
  })

  it('renders the metadata component once a file is added', () => {
    appModule.initializeWeb3(gethProvider)
    wrapper = mount(CreateNewListing, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        requiresMetamask: true,
      },
    })

    const uploadModule = getModule(UploadModule, appStore)
    uploadModule.prepare(emptyMp3File)
    uploadModule.setStatus(ProcessStatus.Ready)

    expect(wrapper.findAll(`#${ethereumLoaderId}`).length).toBe(0)
    expect(wrapper.findAll(`.${fileUploaderClass}`).length).toBe(1)
    expect(wrapper.findAll({ name: fileMetadataComponentName }).length).toBe(1)

    appModule.disconnectWeb3()
  })

  it('renders the List button once a title and description are added', () => {
    const web3Module = getModule(Web3Module, appStore)
    web3Module.initialize(gethProvider)
    wrapper = mount(CreateNewListing, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        requiresMetamask: true,
      },
    })

    const newListingModule = getModule(NewListingModule, appStore)

    expect(wrapper.findAll(`.${buttonClass}`).length).toBe(1)
    expect(wrapper.find(`.${buttonClass}`).attributes()).toHaveProperty('disabled')

    newListingModule.setStatus(ProcessStatus.Ready)
    expect(wrapper.find(`.${buttonClass}`).attributes()).not.toHaveProperty('disabled')

    wrapper.find(`.${buttonClass}`).trigger('click')
    expect(wrapper.find(`.${buttonClass}`).attributes()).toHaveProperty('disabled')
  })
})
