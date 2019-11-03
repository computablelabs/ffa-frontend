import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import VotingModule from '../../../../src/vuexModules/VotingModule'

import VotingDetails from '@/components/voting/VotingDetails.vue'
import VotingDetailsIndex from '@/components/voting/VotingDetailsIndex.vue'
import SubwayItem from '@/components/voting/SubwayItem.vue'

import VotingContractModule from '../../../../src/functionModules/protocol/VotingContractModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'

import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'

import Web3 from 'web3'

// tslint:disable no-shadowed-variable
const localVue = createLocalVue()
localVue.use(VueRouter)

const calcPercent = (partial: number, total: number): string => (
  (partial / total * 100).toFixed(1).toString()
)

const subwayItemContainerClass = 'subway-item-container'
const subwayItemClass = 'item'
const subwayLineClass = 'line'

const acceptDataAttribute = 'span[data-vote-type="accept"]'
const rejectDataAttribute = 'span[data-vote-type="reject"]'
const acceptVotes = 125
const rejectVotes = 69
const passPercentage = 69
const totalVotes = acceptVotes + rejectVotes
const acceptPercentageString = calcPercent(acceptVotes, totalVotes)
const rejectPercentageString = calcPercent(rejectVotes, totalVotes)

const listingHash = '0x306725200a6E0D504A7Cc9e2d4e63A492C72990d'

let votingModule!: VotingModule

describe('VerticalSubway.vue', () => {
  beforeAll(() => {
    localVue.use(VueRouter)
    votingModule = getModule(VotingModule, appStore)
  })

  describe('SubwayItem.vue', () => {
    const wrapper = mount(SubwayItem, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: { isIconTop: true },
    })

    let innerDivs = wrapper.findAll(`.${subwayItemContainerClass} > div`)
    expect(innerDivs.at(0).classes()).toContain(subwayItemClass)
    expect(innerDivs.at(1).classes()).toContain(subwayLineClass)

    wrapper.setProps({isIconTop: false})

    innerDivs = wrapper.findAll(`.${subwayItemContainerClass} > div`)
    expect(innerDivs.at(0).classes()).toContain(subwayLineClass)
    expect(innerDivs.at(1).classes()).toContain(subwayItemClass)
  })

  describe('VotingDetails.vue', () => {

    describe('VotingDetailsBar.vue', () => {
      const candidate = new FfaListing(
        'title0',
        'description0',
        'type0',
        'hash0',
        'md50',
        'MIT',
        5,
        '0xwall3t',
        [],
        FfaListingStatus.candidate,
        121,
        1)

      it('renders percentages correctly', () => {
        VotingContractModule.getStake = (
          listingHash: string,
          account: string,
          web3: Web3): Promise<number> => {
          return Promise.resolve(0)
        }

        MarketTokenContractModule.balanceOf = (
          account: string,
          web3: Web3): Promise<string> => {
            return Promise.resolve('100000000000000000')
        }

        const wrapper = mount(VotingDetails, {
          attachToDocument: true,
          store: appStore,
          localVue,
          propsData: {
            yeaVotes: acceptVotes,
            nayVotes: rejectVotes,
            passPercentage,
            candidate,
          },
        })
        const [ acceptHtml, rejectHtml ] = [wrapper.find(acceptDataAttribute), wrapper.find(rejectDataAttribute)]
        expect(acceptHtml.text()).toBe(`${acceptVotes} yes votes (${acceptPercentageString}%)`)
        expect(rejectHtml.text()).toBe(`${rejectVotes} no votes (${rejectPercentageString}%)`)
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
