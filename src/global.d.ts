import { Nos } from '@computable/computablejs/dist/@types'

declare interface Transaction {
  to?: string;
  from?: string;
  gas?: Nos;
  gasPrice?: Nos;
  nonce?: Nos;
  data?: string;
  value?: Nos;
}

declare interface TransactionParameters {
  nonce: string
  gasPrice: string
  gasLimit: string
  to: string
  from: string
  value: string
  data: string
}

declare interface RpcResponse {
  jsonrpc: string;
  error: any;
  result: any;
  id: any;
}

// TODO: what's up with the semicolons, yo?
declare interface RpcRequest {
  method: string
  params: [TransactionParameters]
  from: string
}

declare global {
  namespace ethereum {
    const isMetaMask: boolean;
    let selectedAddress: string;
    let networkVersion: string;

    function enable(): Promise<string[]>;
    // TODO make it possible to import Transaction from comp.js/...
    function send(request: RpcRequest): Promise<RpcResponse>;
    function sendAsync(request: RpcRequest, callback: (result: any, error: any) => void): void;
  }
}
