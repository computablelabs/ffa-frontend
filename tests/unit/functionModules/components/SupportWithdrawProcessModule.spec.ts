import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import SupportWithdrawModule from '../../../../src/vuexModules/SupportWithdrawModule'
import FfaListingsModule from '../../../../src/vuexModules/FfaListingsModule'

import ListingResult from '../../../../src/interfaces/ListingResult'
import ListingRaw from '../../../../src/interfaces/ListingRaw'
import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'

import {SupportStep} from '../../../../src/models/SupportStep'
import { WithdrawStep } from '../../../../src/models/WithdrawStep'

import SupportWithdrawProcessModule from '../../../../src/functionModules/components/SupportWithdrawProcessModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import ReserveContractModule from '../../../../src/functionModules/protocol/ReserveContractModule'
import EthereumModule from '../../../../src/functionModules/ethereum/EthereumModule'

import flushPromises from 'flush-promises'
import axios, { CancelToken } from 'axios'

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

  const listing = new FfaListing(
    'title',
    'description',
    'pdf',
    '0xhash',
    '',
    '',
    0,
    '',
    [],
    FfaListingStatus.listed,
    0,
    0,
  )

  let appModule!: AppModule
  let supportWithdrawModule!: SupportWithdrawModule
  let ffaListingsModule!: FfaListingsModule

  const cancelTokenSource = axios.CancelToken.source()

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')
    supportWithdrawModule = getModule(SupportWithdrawModule, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)

    ReserveContractModule.getSupportPrice = jest.fn((account: string) => {
      return Promise.resolve(dummySupportPrice)
    })

    EthereumModule.getLastBlock = jest.fn((appModule: AppModule) => {
      appModule.setLastBlock(10)
      return Promise.resolve(10)
    })

    ffaListingsModule.fetchAllListed = jest.fn((cancelToken: CancelToken, owner?: string) => {
      ffaListingsModule.setListed([listing])
      return Promise.resolve()
    })

    MarketTokenContractModule.balanceOf = jest.fn((account: string, appStore: any) => {
      return Promise.resolve('666')
    })
  })

  it ('returns sets the support price in appModule', async () => {
    expect(appModule.supportPrice).toBe(-1)
    await SupportWithdrawProcessModule.getSupportPrice(appStore)
    expect(appModule.supportPrice).toBe(dummySupportPrice)
  })

  it ('returns listings from chain', async () => {
    expect(supportWithdrawModule.listingHashes.length).toBe(0)
    await SupportWithdrawProcessModule.getUserListings(cancelTokenSource.token, appStore)
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
