import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../../../../src/vuexModules/AppModule'
import appStore from '../../../../src/store'

import StaticFileMetadata from '@/components/ui/StaticFileMetadata.vue'
import StaticFfaTags from '@/components/ui/StaticFfaTags.vue'

import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'

import Web3 from 'web3'

describe('StaticFileMetadata.vue', () => {

  const localVue = createLocalVue()
  const web3 = new Web3('http://localhost:8545')
  let appModule!: AppModule

  localVue.component('static-ffa-tagger', StaticFfaTags)

  const staticFileMetadataClass = 'static-file-metadata'

  const ffaListing = new FfaListing('title', 'description', 'type', '0xhash', 'md5',
    'license', 50, '0xwallet', ['foo', 'bar'], FfaListingStatus.candidate, 0, 0)

  let wrapper!: Wrapper<StaticFileMetadata>

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3(web3)
  })

  afterAll(() => {
    wrapper.destroy()
  })

  it ('renders', () => {

    wrapper = mount(StaticFileMetadata, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        ffaListing,
      },
    })

    expect(wrapper.findAll(`.${staticFileMetadataClass}`).length).toBe(1)
    expect(wrapper.findAll('span[data-size="size"]').length).toBe(1)
    expect(wrapper.findAll('span[data-license="license"]').length).toBe(1)
    expect(wrapper.find('.title').text()).toEqual('title')
    expect(wrapper.find('.description').text()).toEqual('description')
    // expect(wrapper.find('.create-date').text()).toEqual('Created 0')
    expect(wrapper.find('.owner').text()).toEqual('0xwalle...')
    expect(wrapper.find('.owner').find('a').attributes('href')).toEqual('/users/0xwallet/')
    expect(wrapper.find('.purchases').text()).toEqual('No purchases')
    expect(wrapper.find('.price').text()).toEqual('less than ETH 0.0001')
  })
})
