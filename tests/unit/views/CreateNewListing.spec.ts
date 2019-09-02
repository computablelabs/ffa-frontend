import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { getModule } from 'vuex-module-decorators'
import appStore from '../../../src/store'
import AppModule from '../../../src/vuexModules/AppModule'
import Web3Module from '../../../src/vuexModules/Web3Module'

import CreateNewListing from '@/views/CreateNewListing.vue'
import FileUploader from '@/components/listing/FileUploader.vue'

import MetamaskModule from '../../../src/functionModules/metamask/MetamaskModule'

import Servers from '../../../src/util/Servers'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import web3 from 'web3'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faPlusSquare, faEthereum)
const createNewListingId = 'create-new-listing'
const ethereumLoaderId = 'ethereum-loader'
const fileUploaderClass = 'file-uploader'
const fileMetadataClass = 'file-metadata'

describe('CreateNewListing.vue', () => {

  const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'

  const w3 = new web3(Servers.SkynetJsonRpc)
  const gethProvider = w3.currentProvider

  let wrapper: Wrapper<CreateNewListing>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)

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
    wrapper = mount(CreateNewListing, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        requiresMetamask: true,
      },
    })
    expect(wrapper.findAll(`#${ethereumLoaderId}`).length).toBe(1)
  })

  it('renders renders the page', () => {
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
    expect(wrapper.findAll(`#${ethereumLoaderId}`).length).toBe(0)
    expect(wrapper.findAll(`.${fileUploaderClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${fileMetadataClass}`).length).toBe(1)
    web3Module.disconnect()
  })
})
