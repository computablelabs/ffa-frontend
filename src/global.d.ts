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

declare interface RpcResponse {
  jsonrpc: string;
  error: any;
  result: any;
  id: any;
}

declare global {
  namespace ethereum {
    const isMetaMask: boolean;
    let selectedAddress: string;
    let networkVersion: string;

    function enable(): Promise<string[]>;
    // TODO make it possible to import Transaction from comp.js/...
    function send(opts:Transaction): Promise<RpcResponse>;
  }
}
