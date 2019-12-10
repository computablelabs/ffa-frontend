import { getModule } from 'vuex-module-decorators'
import { Store } from 'vuex'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import PurchaseModule from '../../../../src/vuexModules/PurchaseModule'

import PurchaseProcessModule from '../../../../src/functionModules/components/PurchaseProcessModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'
import EthereumModule from '../../../../src/functionModules/ethereum/EthereumModule'
import DatatrustContractModule from '../../../../src/functionModules/protocol/DatatrustContractModule'

import FfaListing, { FfaListingStatus } from '../../../../src/models/FfaListing'
import { PurchaseStep } from '../../../../src/models/PurchaseStep'

import { Config } from '../../../../src/util/Config'
import { WaitTimes } from '../../../../src/util/Constants'

import Web3 from 'web3'

// tslint:disable no-shadowed-variable
describe('PurchaseProcessModule.ts', () => {

  const listingHash = '0x1234567'

  const listing = new FfaListing(
    'title',
    'description',
    'type',
    listingHash,
    'md5',
    'license',
    1024,
    '0xwallet',
    [],
    FfaListingStatus.listed,
    10,
    10)

  let appModule!: AppModule
  let purchaseModule!: PurchaseModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')
    purchaseModule = getModule(PurchaseModule, appStore)

    appModule.setCostPerByte(10)
    appModule.setMarketTokenBalance(0)
    appModule.setEtherTokenDatatrustAllowance(0)
    purchaseModule.setListing(listing)

    Config.BlockchainWaitTime = WaitTimes.TEST
  })

  it('computes purchase price', () => {
    const price = PurchaseProcessModule.getPurchasePrice(appStore)
    expect(price).toBe(10240)
  })

  it('updates EtherToken balance', async () => {
    EtherTokenContractModule.balanceOf = jest.fn(
      (account: string, spender: string, web3: Web3) => {
        return Promise.resolve('20000')
     })

    await PurchaseProcessModule.checkEtherTokenBalance(appStore)

    expect(appModule.etherTokenBalance).toBe(20000)
    expect(purchaseModule.purchaseStep).toEqual(PurchaseStep.ApproveSpending)
  })

  it('correctly determines if the listing was purchased', async () => {
    ethereum.selectedAddress = 'owner'
    DatatrustContractModule.getDelivery = jest.fn(() => Promise.resolve(['owner']))
    DatatrustContractModule.isDelivered = jest.fn(() => Promise.resolve(false))

    expect(await PurchaseProcessModule.checkListingPurchased(listing, appStore)).toBeTruthy()

    DatatrustContractModule.getDelivery = jest.fn(() => Promise.resolve(['notOwner']))

    expect(await PurchaseProcessModule.checkListingPurchased(listing, appStore)).toBeFalsy()

    DatatrustContractModule.isDelivered = jest.fn(() => Promise.resolve(true))

    expect(await PurchaseProcessModule.checkListingPurchased(listing, appStore)).toBeTruthy()
  })

  it('updates datatrust contract allowance', async () => {
    EthereumModule.getEtherTokenContractAllowance = jest.fn(
      (contractAddress: string, appStore: Store<any>) => {
        getModule(AppModule, appStore).setEtherTokenDatatrustAllowance(30000)
        return Promise.resolve()
     })

    EtherTokenContractModule.allowance = jest.fn(
      () => Promise.resolve(30000))

    await PurchaseProcessModule.checkEtherTokenDatatrustContractAllowance(appStore)

    expect(appModule.etherTokenDatatrustContractAllowance).toBe(30000)
    expect(purchaseModule.purchaseStep).toEqual(PurchaseStep.PurchaseListing)
  })
})
