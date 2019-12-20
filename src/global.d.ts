import { Nos } from '@computable/computablejs/dist/@types'
import Web3 from 'web3'
import amplitude, { AmplitudeClient } from 'amplitude-js'

declare interface Transaction {
  to?: string
  from?: string
  gas?: Nos
  gasPrice?: Nos
  nonce?: Nos
  data?: string
  value?: Nos
}

declare interface RpcRequest {
  method: string
  params: any[]
  from: string
}

declare interface RpcResponse {
  jsonrpc: string
  error: any
  result: any
  id: any
}

declare global {
  namespace ethereum {
    const isMetaMask: boolean
    let selectedAddress: string
    let networkVersion: string

    function enable(): Promise<string[]>
    // TODO make it possible to import Transaction from comp.js/...
    function send(opts: Transaction): Promise<RpcResponse>
    function sendAsync(request: RpcRequest, callback: (err: any, res: any) => void): void
  }
  namespace amplitude {
    function getInstance(): AmplitudeClient
  }
}
