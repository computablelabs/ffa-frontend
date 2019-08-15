import { Transaction } from '../global'
import Web3 from 'web3'
import Flash from '../models/Flash'
import { FlashType } from '../models/Flash'
import { Errors, Messages } from '../util/Constants'
import Web3Module from '../vuexModules/Web3Module'
import MetaMaskModule from '../vuexModules/MetaMaskModule'
import FlashesModule from '../vuexModules/FlashesModule'
import ListModule from '../vuexModules/ListModule'
import UploadModule from '../vuexModules/UploadModule'

export async function enable(): Promise<string|Error> {
  let result: string

  try {
    const ary = await ethereum.enable()
    result = ary[0]
  } catch (e) {
    result = e
  }

  return result
}

// TODO: consider an error callback, like for resetting state
export async function send(web3: Web3,
                           opts: Transaction,
                           flashesModule: FlashesModule,
                           listModule: ListModule,
                           uploadModule: UploadModule,
                           successCallback: (response: any,
                                             flashesModule: FlashesModule,
                                             listModule: ListModule,
                                             uploadModule: UploadModule) => void) {

  opts.gas = web3.utils.toHex(opts.gas)
  opts.gasPrice = web3.utils.toHex(opts.gasPrice)

  ethereum.sendAsync({
    method: 'eth_sendTransaction',
    params: [opts], // NOTE: do not miss that this is an array of 1
    from: ethereum.selectedAddress,
  }, (err: any, res: any) => {
    if (err) {
      flashesModule.append(new Flash(err, FlashType.error))
    } else {
      if (successCallback) {
        successCallback(res, flashesModule, listModule, uploadModule)
      }
    }
  })
}

export const enableEthereum = async (flashesModule: FlashesModule,
                                     metaMaskModule: MetaMaskModule,
                                     web3Module: Web3Module) => {
  const result = await enable()
  const accept = typeof result === 'string'

  let message = Errors.METAMASK_NOT_CONNECTED
  let flashType = FlashType.error

  if (accept) {
    web3Module.initialize(ethereum)
    metaMaskModule.setPublicKey(result as string)
    message = Messages.METAMASK_CONNECTED
    flashType = FlashType.success
  }
  flashesModule.append(new Flash(message, flashType))
}
