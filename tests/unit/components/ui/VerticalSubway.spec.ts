import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import VerticalSubway from '@/components/ui/VerticalSubway.vue'
import appStore from '../../../../src/store'
import VotingDetails from '@/components/ui/VotingDetails.vue'
import VotingDetailsIndex from '@/components/ui/VotingDetailsIndex.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faExclamationCircle, faBars, faDotCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const localVue = createLocalVue()
localVue.use(VueRouter)
library.add(faExclamationCircle, faBars, faDotCircle)

const calcPercent = (partial: number, total: number): string => (
  (partial / total * 100).toFixed(1).toString()
)

const acceptDataAttribute = 'span[data-vote-type="accept"]'
const rejectDataAttribute = 'span[data-vote-type="reject"]'
const acceptVotes = 125
const rejectVotes = 69
const passPercentage = 69
const totalVotes = acceptVotes + rejectVotes
const acceptPercentageString = calcPercent(acceptVotes, totalVotes)
const rejectPercentageString = calcPercent(rejectVotes, totalVotes)

describe('VerticalSubway.vue', () => {
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
