import { createLocalVue, Wrapper, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'

import VotingDetailsBar from '../../../../src/components/voting/VotingDetailsBar.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const calcPercent = (partial: number, total: number): string => (
  (partial / total * 100).toFixed(1).toString()
)

const acceptDataAttribute = 'span[data-vote-type="accept"]'
const rejectDataAttribute = 'span[data-vote-type="reject"]'
const acceptVotes = 125
const rejectVotes = 69
const plurality = 69
const totalVotes = acceptVotes + rejectVotes
const acceptPercentageString = calcPercent(acceptVotes, totalVotes)
const rejectPercentageString = calcPercent(rejectVotes, totalVotes)

let wrapper!: Wrapper<VotingDetailsBar>

describe('VotingDetailsBar.vue', () => {
  it('renders percentages correctly', () => {
    wrapper = mount(VotingDetailsBar, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        yeaVotes: acceptVotes,
        nayVotes: rejectVotes,
        plurality,
      },
    })

    const [ acceptHtml, rejectHtml ] = [wrapper.find(acceptDataAttribute), wrapper.find(rejectDataAttribute)]
    expect(acceptHtml.text()).toBe(`${acceptVotes} Yes votes (${acceptPercentageString}%)`)
    expect(rejectHtml.text()).toBe(`${rejectVotes} No votes (${rejectPercentageString}%)`)
  })
})
