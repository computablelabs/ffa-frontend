import { createLocalVue, mount, Wrapper } from '@vue/test-utils'

import StaticFileMetadata from '@/components/ui/StaticFileMetadata.vue'
import StaticFfaTags from '@/components/ui/StaticFfaTags.vue'

import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'

describe('StaticFileMetadata.vue', () => {

  const localVue = createLocalVue()
  localVue.component('static-ffa-tagger', StaticFfaTags)

  const fileMetadataClass = 'file-metadata'

  const ffaListing = new FfaListing('title', 'description', 'type', '0xhash', 'md5',
    'license', 50, '0xwallet', ['foo', 'bar'], FfaListingStatus.candidate, 0, 0)

  let wrapper!: Wrapper<StaticFileMetadata>

  afterAll(() => {
    wrapper.destroy()
  })

  it ('renders', () => {

    wrapper = mount(StaticFileMetadata, {
      localVue,
      attachToDocument: true,
      propsData: {
        ffaListing,
      },
    })

    expect(wrapper.findAll(`.${fileMetadataClass}`).length).toBe(1)
    expect(wrapper.findAll('span[data-size="size"]').length).toBe(1)
    expect(wrapper.findAll('span[data-license="license"]').length).toBe(1)
    expect(wrapper.find('.title').text()).toEqual('title')
    expect(wrapper.find('.description').text()).toEqual('description')
    expect(wrapper.find('.create-date').text()).toEqual('Created 0')
    expect(wrapper.find('.owner').text()).toEqual('0xwallet')
    expect(wrapper.find('.purchases').text()).toEqual('No purchases')
  })
})
