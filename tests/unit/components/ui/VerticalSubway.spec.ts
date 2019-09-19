import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import SubwayItem from '@/components/voting/SubwayItem.vue'
import appStore from '../../../../src/store'
import VotingDetails from '@/components/voting/VotingDetails.vue'
import VotingDetailsIndex from '@/components/voting/VotingDetailsIndex.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faExclamationCircle, faBars, faDotCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const localVue = createLocalVue()
localVue.use(VueRouter)
library.add(faExclamationCircle, faBars, faDotCircle)

const calcPercent = (partial: number, total: number): string => (
  (partial / total * 100).toFixed(1).toString()
)

const subwayItemWrapperTopClass = '.subway-item-top'
const subwayItemContainerTopClass = '.subway-item-container-top'
const subwayIconTopClass = '.subway-icon-top'
const subwayItemWrapperBottomClass = '.subway-item-bottom'
const subwayItemContainerBottomClass = '.subway-item-container-bottom'
const subwayIconBottomClass = '.subway-icon-bottom'

const acceptDataAttribute = 'span[data-vote-type="accept"]'
const rejectDataAttribute = 'span[data-vote-type="reject"]'
const acceptVotes = 125
const rejectVotes = 69
const passPercentage = 69
const totalVotes = acceptVotes + rejectVotes
const acceptPercentageString = calcPercent(acceptVotes, totalVotes)
const rejectPercentageString = calcPercent(rejectVotes, totalVotes)

describe('VerticalSubway.vue', () => {

  describe('SubwayItem.vue', () => {
    const wrapper = mount(SubwayItem, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: { isIconTop: true },
    })
    expect(wrapper.findAll(`${subwayItemWrapperTopClass}`).length).toBe(1)
    expect(wrapper.findAll(`${subwayItemContainerTopClass}`).length).toBe(1)
    expect(wrapper.findAll(`${subwayIconTopClass}`).length).toBe(1)

    wrapper.setProps({isIconTop: false})

    expect(wrapper.findAll(`${subwayItemWrapperBottomClass}`).length).toBe(1)
    expect(wrapper.findAll(`${subwayItemContainerBottomClass}`).length).toBe(1)
    expect(wrapper.findAll(`${subwayIconBottomClass}`).length).toBe(1)
  })

  describe('VotingDetails.vue', () => {

    beforeAll(() => {
      localVue.use(VueRouter)
      localVue.component('font-awesome-icon', FontAwesomeIcon)
    })

    describe('VotingDetailsBar.vue', () => {
      it('renders percentages correctly', () => {
        const wrapper = mount(VotingDetails, {
          attachToDocument: true,
          store: appStore,
          localVue,
          propsData: {
            yeaVotes: acceptVotes,
            nayVotes: rejectVotes,
            passPercentage,
          },
        })
        const [ acceptHtml, rejectHtml ] = [wrapper.find(acceptDataAttribute), wrapper.find(rejectDataAttribute)]
        expect(acceptHtml.text()).toBe(`Accept: ${acceptPercentageString}%`)
        expect(rejectHtml.text()).toBe(`Reject: ${rejectPercentageString}%`)
      })
    })

    describe('VotingDetailsIndex.vue', () => {
      it('renders votes correctly', () => {
        const wrapper = mount(VotingDetailsIndex, {
          attachToDocument: true,
          store: appStore,
          localVue,
          propsData: {
            yeaVotes: acceptVotes,
            nayVotes: rejectVotes,
            passPercentage,
          },
        })
        expect(wrapper.find('.votes-info').text()).toBe(`${acceptVotes} Accept Votes`)
        wrapper.setProps({ yeaVotes: undefined, nayVotes: rejectVotes})
        expect(wrapper.find('.votes-info').text()).toBe(`${rejectVotes} Reject Votes`)
      })
    })
  })
})
