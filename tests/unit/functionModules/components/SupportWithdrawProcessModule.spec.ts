import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import ListingResult from '../../../../src/interfaces/ListingResult'
import ListingRaw from '../../../../src/interfaces/ListingRaw'
import ProtocolListing from '../../../../src/interfaces/ProtocolListing'

import {SupportStep} from '../../../../src/models/SupportStep'

import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import ReserveContractModule from '../../../../src/functionModules/protocol/ReserveContractModule'
import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'

import flushPromises from 'flush-promises'

// tslint:disable no-shadowed-variable

describe('SupportWithdrawProcessModule.ts', () => {

  const dummySupportPrice = 500000000

  const returnValues: ListingResult = {
    hash: '0xstring,',
    owner: '0xowner',
    reward: '0xreward',
  }

  const raw: ListingRaw = {
    data: 'data',
    topics: [],
  }

  const listing: ProtocolListing = {
    address: '123',
    blockNumber: 0,
    transactionHash: '0xhash',
    transactionIndex: 1,
    blockHash: '0xfoo',
    logIndex: 12,
    removed: false,
    id: 'id',
    returnValues,
    event: 'event',
    signature: 'sig',
    raw,
  }

  let appModule!: AppModule
  let web3Module!: Web3Module
  let supportWithdrawModule!: SupportWithdrawModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)

    ReserveContractModule.getSupportPrice = jest.fn((account: string) => {
      return Promise.resolve(dummySupportPrice)
    })

    ListingContractModule.getAllListingsForAccount = jest.fn((account: string, appStore: any) => {
      return Promise.resolve([listing])
    })
  })

  it ('returns sets the support price in appModule', async () => {
    expect(appModule.supportPrice).toBe(-1)
    await SupportWithdrawProcessModule.getSupportPrice(appStore)
    expect(appModule.supportPrice).toBe(dummySupportPrice)
  })

  it ('returns a listings from chain', async () => {
    expect(supportWithdrawModule.listingHashes.length).toBe(0)
    await SupportWithdrawProcessModule.getUserListings(appStore)
    expect(supportWithdrawModule.listingHashes.length).toBe(1)
  })

  it ('sets supportStep based on available eth', () => {
    expect(supportWithdrawModule.supportStep).toBe(SupportStep.WrapETH)
    SupportWithdrawProcessModule.checkEthereumBalance(appStore, 100)
    expect(supportWithdrawModule.supportStep).toBe(SupportStep.InsufficientETH)
    appModule.setEthereumBalance(500)
    SupportWithdrawProcessModule.checkEthereumBalance(appStore, 100)
    expect(supportWithdrawModule.supportStep).toBe(SupportStep.WrapETH)
  })

  it('sets promotes supportStep on enough ether token', () => {
    supportWithdrawModule.setSupportStep(SupportStep.WrapETHPending)
    SupportWithdrawProcessModule.checkEtherTokenBalance(appStore, 100)
    expect(supportWithdrawModule.supportStep).toBe(SupportStep.WrapETHPending)
    appModule.setEtherTokenBalance(500)
    SupportWithdrawProcessModule.checkEtherTokenBalance(appStore, 100)
    expect(supportWithdrawModule.supportStep).toBe(SupportStep.ApproveSpending)
  })

  it('updates market token balance', async () => {
    MarketTokenContractModule.balanceOf = jest.fn((account: string) => {
      return Promise.resolve('1000')
    })
    expect(appModule.marketTokenBalance).toBe(-1)
    SupportWithdrawProcessModule.afterCollectIncome(appStore)

    await flushPromises()

    expect(appModule.marketTokenBalance).toBe(1000)
  })

  it('converts supportValue to market tokens', () => {
    appModule.setSupportPrice(dummySupportPrice)
    web3Module.initialize('http://localhost:8545')
    supportWithdrawModule.setSupportValue(dummySupportPrice * 1000000000)
    expect(SupportWithdrawProcessModule.weiToMarketTokens(supportWithdrawModule.supportValue, appStore)).toBe(0.25)
  })

})
