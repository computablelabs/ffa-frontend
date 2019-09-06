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
    expect(wrapper.findAll('input').length).toBe(1)
    expect(wrapper.findAll('span[data-size="size"]').length).toBe(1)
    expect(wrapper.findAll('span[data-license="license"]').length).toBe(1)
    const input = wrapper.find('input').element as HTMLInputElement
    expect(input.readOnly).toBeTruthy()
    expect(input.value).toEqual('title')
    expect(wrapper.findAll('textarea').length).toBe(1)
    const textarea = wrapper.find('textarea').element as HTMLTextAreaElement
    expect(textarea.readOnly).toBeTruthy()
    expect(textarea.value).toEqual('description')
  })
})
