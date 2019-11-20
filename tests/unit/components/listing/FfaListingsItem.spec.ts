import VueRouter from 'vue-router'
import { createLocalVue, shallowMount, mount, Wrapper} from '@vue/test-utils'
import FfaListingsItem from '../../../../src/components/listing/FfaListingsItem.vue'
import appStore from '../../../../src/store'
import { FfaListingStatus} from '../../../../src/models/FfaListing'

const localVue = createLocalVue()

const iconColumnClass = 'icon-column'
const listingTitleClass = 'listing-title'
const descriptionClass = 'description'
const jazzIconCellClass = 'jazzicon-cell'
const addressContainerClass = 'address-container'
const addressClass = 'address'

describe('FfaListingsItem.vue', () => {
  const owner = 'owner1'
  const title = 'title'
  const description = 'description'
  const fileType = 'image/gif'
  const listingHash = '0xhash'
  const md5 = '0xmd5'
  const tags = ['a', 'b']

  const candidate = {
    owner,
    title,
    description,
    fileType,
    listingHash,
    md5,
    tags,
    status: FfaListingStatus.candidate,
  }

  let wrapper!: Wrapper<FfaListingsItem>

  beforeAll(async () => {
    localVue.use(VueRouter)

  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('render item', () => {
    it('correctly renders table elements', async () => {
      wrapper = shallowMount(FfaListingsItem, {
        attachToDocument: true,
        store: appStore,
        propsData: {
          key: candidate.listingHash,
          status: candidate.status,
          listing: candidate,
        },
      })

      expect(wrapper.findAll('tr').length).toBe(1)
      const tr = wrapper.find('tr').element as HTMLTableRowElement
      expect(tr.getAttribute('key')).not.toBeNull()
      expect(tr.getAttribute('key')).toEqual(listingHash)
      expect(wrapper.findAll('td').length).toBe(4)
      expect(wrapper.findAll(`td.${iconColumnClass}`).length).toBe(1)
      expect(wrapper.findAll('fileicon-stub').length).toBe(1)
      expect(wrapper.findAll(`td.${listingTitleClass}`).length).toBe(1)
      expect(wrapper.find(`td.${listingTitleClass}`).text()).toEqual(title)
      expect(wrapper.findAll(`td.${descriptionClass}`).length).toBe(1)
      expect(wrapper.find(`td.${descriptionClass}`).text()).toEqual(description)
      expect(wrapper.findAll(`td.${jazzIconCellClass}`).length).toBe(1)
      expect(wrapper.findAll(`td.${jazzIconCellClass} .${addressContainerClass}`).length).toBe(1)
      expect(wrapper.findAll(`.${addressClass}`).length).toBe(1)
      expect(wrapper.find(`.${addressClass}`).text()).toEqual(`${owner}...`)
    })
  })
})
