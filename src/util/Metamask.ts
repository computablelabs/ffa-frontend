// import { Errors } from './Constants'
import { Transaction, RpcResponse } from '../global'
import Web3 from 'web3'
import FlashesModule from '../modules/FlashesModule'
import Flash from '../models/Flash'
import { FlashType } from '../models/Flash'
import MetaMaskModule from '../../src/modules/MetaMaskModule'
import { Errors, Messages } from '../util/Constants'
import Web3Module from '../../src/modules/Web3Module'

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

export async function send(web3: Web3, opts: Transaction, flashesModule: FlashesModule) {
  opts.gas = web3.utils.toHex(opts.gas)
  opts.gasPrice = web3.utils.toHex(opts.gasPrice)
  // debugger
  ethereum.sendAsync({
    method: 'eth_sendTransaction',
    params: [opts], // NOTE: do not miss that this is an array of 1
    from: ethereum.selectedAddress,
  }, (err: any, res: any) => {
    if (err) {
      // TODO: complain
    } else {
      flashesModule.append(new Flash(`Transaction hash: ${res.result}`, FlashType.info))
    }
  })
}

export const setPublicKey = async (flashesModule: FlashesModule,
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
