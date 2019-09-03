import { Transaction } from '../../global'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'
import { Errors, Messages } from '../../util/Constants'
import Web3Module from '../../vuexModules/Web3Module'
import FlashesModule from '../../vuexModules/FlashesModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModule from '../../vuexModules/UploadModule'

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

  public static async enableEthereum(flashesModule: FlashesModule,
                                     web3Module: Web3Module): Promise<boolean> {

    const result = await MetamaskModule.enable()
    const accept = typeof result === 'string'

    let message = Errors.METAMASK_NOT_CONNECTED
    let flashType = FlashType.error

    if (accept) {
      web3Module.initialize(ethereum)
      message = Messages.METAMASK_CONNECTED
      flashType = FlashType.success
    }
    flashesModule.append(new Flash(message, flashType))
    return accept
  }

  public static async send(web3: Web3,
                           opts: Transaction,
                           flashesModule: FlashesModule,
                           newListingModule: NewListingModule,
                           uploadModule: UploadModule,
                           successCallback: (response: any,
                                             flashesModule: FlashesModule,
                                             newListingModule: NewListingModule,
                                             uploadModule: UploadModule) => void) {

    opts.gas = web3.utils.toHex(opts.gas)
    opts.gasPrice = web3.utils.toHex(opts.gasPrice)

    ethereum.sendAsync({
      method: 'eth_sendTransaction',
      params: [opts], // NOTE: do not miss that this is an array of 1
      from: ethereum.selectedAddress,
      },
      (err: any, res: any) => {
        if (err) {
          flashesModule.append(new Flash(err, FlashType.error))
        } else if (successCallback) {
          successCallback(res, flashesModule, newListingModule, uploadModule)
        }
      })
  }
}
