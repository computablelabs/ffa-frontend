import { TransactOpts } from '@computable/computablejs/dist/interfaces'

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
    function send(opts:TransactOpts): Promise<RpcResponse>;
  }
}
