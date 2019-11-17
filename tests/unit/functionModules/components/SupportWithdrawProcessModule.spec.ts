import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'

import ListingResult from '../../../../src/interfaces/ListingResult'
import ListingRaw from '../../../../src/interfaces/ListingRaw'
import ProtocolListing from '../../../../src/interfaces/ProtocolListing'

import {SupportStep} from '../../../../src/models/SupportStep'
import { WithdrawStep } from '../../../../src/models/WithdrawStep'

import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import ReserveContractModule from '../../../../src/functionModules/protocol/ReserveContractModule'
import ListingContractModule from '../../../../src/functionModules/protocol/ListingContractModule'
import DatatrustModule from '../../../../src/functionModules/datatrust/DatatrustModule'

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
  let supportWithdrawModule!: SupportWithdrawModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)

    ReserveContractModule.getSupportPrice = jest.fn((account: string) => {
      return Promise.resolve(dummySupportPrice)
    })

    ListingContractModule.getAllListingsForAccount = jest.fn((account: string, appStore: any) => {
      return Promise.resolve([listing])
    })

    MarketTokenContractModule.balanceOf = jest.fn((account: string, appStore: any) => {
      return Promise.resolve('666')
    })

    DatatrustModule.getListed = jest.fn((lastBlock?: number): any => {
      return ['0xhash']
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

  it('correctly returns hasEnoughEth', () => {
    appModule.setEthereumBalance(-1)
    expect(SupportWithdrawProcessModule.hasEnoughEth(100, appStore)).toBeFalsy()
    appModule.setEthereumBalance(999)
    expect(SupportWithdrawProcessModule.hasEnoughEth(100, appStore)).toBeTruthy()
  })

  it('correctly returns hasEnoughWeth', () => {
    supportWithdrawModule.setSupportValue(100)
    appModule.setEtherTokenBalance(-1)
    expect(SupportWithdrawProcessModule.hasEnoughWeth(appStore)).toBeFalsy()
    appModule.setEtherTokenBalance(999)
    expect(SupportWithdrawProcessModule.hasEnoughWeth(appStore)).toBeTruthy()
  })

  it('correctly returns hasEnoughReserveApproval', () => {
    supportWithdrawModule.setSupportValue(100)
    appModule.setEtherTokenReserveAllowance(-1)
    expect(SupportWithdrawProcessModule.hasEnoughReserveApproval(appStore)).toBeFalsy()
    appModule.setEtherTokenReserveAllowance(999)
    expect(SupportWithdrawProcessModule.hasEnoughReserveApproval(appStore)).toBeTruthy()
  })

  it('correctly promotes from CollectIncome', () => {
    supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)
    supportWithdrawModule.setListingHashes(['0xhash'])
    SupportWithdrawProcessModule.checkForIncome(appStore)
    expect(supportWithdrawModule.withdrawStep).toBe(WithdrawStep.UnwrapWETH)
    supportWithdrawModule.setWithdrawStep(WithdrawStep.CollectIncome)
    SupportWithdrawProcessModule.checkForIncome(appStore)
    expect(supportWithdrawModule.withdrawStep).toBe(WithdrawStep.CollectIncome)
    supportWithdrawModule.setListingHashes([])
    SupportWithdrawProcessModule.checkForIncome(appStore)
    expect(supportWithdrawModule.withdrawStep).toBe(WithdrawStep.Withdraw)
  })

  it('updates market token balance', async () => {
    expect(appModule.marketTokenBalance).toBe(-1)
    SupportWithdrawProcessModule.afterCollectIncome(appStore)

    await flushPromises()

    expect(appModule.marketTokenBalance).toBe(666)
  })

  it('converts wei to market tokens', () => {
    appModule.setSupportPrice(-1)
    supportWithdrawModule.setSupportValue(dummySupportPrice * 1000000000)
    expect(SupportWithdrawProcessModule.weiToMarketTokens(supportWithdrawModule.supportValue, appStore)).toBe(0.5)
  })

  it('converts supportValue to market tokens', () => {
    appModule.setSupportPrice(dummySupportPrice)
    supportWithdrawModule.setSupportValue(dummySupportPrice * 1000000000)
    const marketTokens = SupportWithdrawProcessModule.supportValueToMarketTokens(appStore)
    expect(marketTokens).toBe(1)
  })

})
