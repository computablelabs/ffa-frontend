// import { Errors } from './Constants'
import { Transaction, RpcResponse } from '../global'
import Web3 from 'web3'
import FlashesModule from '../vuexModules/FlashesModule'
import Flash from '../models/Flash'
import { FlashType } from '../models/Flash'

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
