import { shallowMount } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import PurchaseModule from '../../../src/vuexModules/PurchaseModule'
import appStore from '../../../src/store'
import FfaProcessModule from '../../../src/interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../../../src/models/ProcessStatus'
import { PurchaseStep } from '../../../src/models/PurchaseStep'
import FfaListing, { FfaListingStatus } from '../../../src/models/FfaListing'

describe('PurchaseModule.ts', () => {

  it('correctly implements the correct interface', () => {
    const purchaseModule = getModule(PurchaseModule, appStore)
    expect((purchaseModule as FfaProcessModule).prepare).not.toBeNull()
    expect((purchaseModule as FfaProcessModule).namespace).not.toBeNull()
    expect((purchaseModule as FfaProcessModule).percentComplete).not.toBeNull()
    expect((purchaseModule as FfaProcessModule).status).not.toBeNull()
  })

  it('correctly exposes getters', () => {
    const purchaseModule = getModule(PurchaseModule, appStore)
    expect(purchaseModule.namespace).toEqual('purchaseModule')
    expect(purchaseModule.listing).toBeDefined()
    expect(purchaseModule.listing.hash).toEqual('')
    expect(purchaseModule.status).toEqual(ProcessStatus.NotReady)
    expect(purchaseModule.purchaseStep).toEqual(PurchaseStep.CreateToken)
    expect(purchaseModule.erc20TokenTransactionId).toEqual('')
    expect(purchaseModule.approvePaymentTransactionId).toEqual('')
    expect(purchaseModule.purchaseListingTransactionId).toEqual('')
  })

  it ('correctly mutates state', () => {

    const ffaListing = new FfaListing(
      'title',
      'desc',
      'image/gif',
      '0xbanana',
      'md5',
      'MIT',
      65,
      '0xwall3t',
      [],
      FfaListingStatus.listed,
      122019,
      70)

    const purchaseModule = getModule(PurchaseModule, appStore)

    expect(purchaseModule.listing).toBeDefined()
    expect(purchaseModule.listing.title).toEqual('')
    expect(purchaseModule.status).toEqual(ProcessStatus.NotReady)
    purchaseModule.prepare(ffaListing)
    expect(purchaseModule.listing).toBeDefined()
    expect(purchaseModule.listing.title).toEqual('title')
    purchaseModule.setStatus(ProcessStatus.Ready)
    expect(purchaseModule.status).toEqual(ProcessStatus.Ready)
    purchaseModule.setStatus(ProcessStatus.Error)
    expect(purchaseModule.status).toEqual(ProcessStatus.Error)
    expect(purchaseModule.percentComplete).toBe(0)
    purchaseModule.setPercentComplete(42)
    expect(purchaseModule.percentComplete).toBe(42)
    expect(purchaseModule.purchaseStep).toEqual(PurchaseStep.CreateToken)
    purchaseModule.setPurchaseStep(PurchaseStep.PurchaseListing)
    expect(purchaseModule.purchaseStep).toEqual(PurchaseStep.PurchaseListing)
    purchaseModule.setErc20TokenTransactionId('0x123')
    expect(purchaseModule.erc20TokenTransactionId).toEqual('0x123')
    purchaseModule.setApprovePaymentTransactionId('0x456')
    expect(purchaseModule.approvePaymentTransactionId).toEqual('0x456')
    purchaseModule.setPurchaseListingTransactionId('0x789')
    expect(purchaseModule.purchaseListingTransactionId).toEqual('0x789')

    purchaseModule.reset()
    expect(purchaseModule.listing).toBeDefined()
    expect(purchaseModule.listing.title).toEqual('')
    expect(purchaseModule.status).toEqual(ProcessStatus.NotReady)
    expect(purchaseModule.percentComplete).toEqual(0)
    expect(purchaseModule.purchaseStep).toEqual(PurchaseStep.CreateToken)
    expect(purchaseModule.erc20TokenTransactionId).toEqual('')
    expect(purchaseModule.approvePaymentTransactionId).toEqual('')
    expect(purchaseModule.purchaseListingTransactionId).toEqual('')
  })
})
