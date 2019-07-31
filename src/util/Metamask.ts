// import { Errors } from './Constants'
import { Transaction, RpcResponse } from '../global'

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

// TODO why can't I import the Transaction from `@computable/.../@types`?
// TODO: do we need this helper here?  the pattern is a little more complicated
// export async function send(tx: Transaction): Promise<RpcResponse> {
//   return ethereum.send(tx)
// }
