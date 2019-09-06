import { TransactOpts } from '@computable/computablejs/dist/interfaces'
import { buildTransaction } from '@computable/computablejs/dist/helpers'

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import { Transaction } from '../../global'

import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'

import Web3Module from '../../vuexModules/Web3Module'
import FlashesModule from '../../vuexModules/FlashesModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModule from '../../vuexModules/UploadModule'

import { Errors, Messages, ZERO_HASHED } from '../../util/Constants'

import Web3 from 'web3'

export default class MetamaskModule {

  public static async enable(): Promise<string|Error> {
    let result: string
    try {
      const ary = await ethereum.enable()
      result = ary[0]
    } catch (e) {
      console.log(e)
      result = e
    }
    return result
  }

  public static async enableEthereum(flashesModule: FlashesModule, web3Module: Web3Module): Promise<boolean> {

    const result = await MetamaskModule.enable()
    const enabled = typeof result === 'string'

    let message = Errors.METAMASK_NOT_CONNECTED
    let flashType = FlashType.error

    if (enabled) {
      web3Module.initialize(ethereum)
      message = Messages.METAMASK_CONNECTED
      flashType = FlashType.success
    }
    flashesModule.append(new Flash(message, flashType))
    return enabled
  }

  public static async buildAndSendTransaction(
    account: string,
    method: [Transaction, TransactOpts],
    contractAddress: string,
    appStore: Store<any>,
    success: (
      response: any,
      appStore: Store<any>) => void) {

    const web3Module = getModule(Web3Module, appStore)

    //  get gas estimate using method[0]
    // @ts-ignore
    const est = await method[0].estimateGas({from: account})
    debugger
    const unsigned = await buildTransaction(web3Module.web3, method)
    debugger
    unsigned.to = contractAddress
    unsigned.value = ZERO_HASHED
    // MM ignores any nonce, let's just remove it
    delete unsigned.nonce
    // take the larger of the two gas estimates to be safe
    if (est > unsigned.gas) {
      unsigned.gas = est
    }

    MetamaskModule.send(web3Module.web3, unsigned, appStore, success)
  }

  public static async send(
    web3: Web3,
    unsignedTransaction: Transaction,
    appStore: Store<any>,
    successCallback: (
      response: any,
      appStore: Store<any>) => void) {

    unsignedTransaction.gas = web3.utils.toHex(unsignedTransaction.gas)
    unsignedTransaction.gasPrice = web3.utils.toHex(unsignedTransaction.gasPrice)

    ethereum.sendAsync(
      {
        method: 'eth_sendTransaction',
        params: [unsignedTransaction], // NOTE: do not miss that this is an array of 1
        from: ethereum.selectedAddress,
      },
      (err: any, res: any) => {
        if (err) {
          const flashesModule  = getModule(FlashesModule, appStore)
          flashesModule.append(new Flash(err, FlashType.error))
        } else if (successCallback) {
          successCallback(res, appStore)
        }
      })
  }
}
