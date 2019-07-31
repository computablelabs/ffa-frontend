import { RpcRequest, TransactionParameters } from 'global'

import { enable } from '../../util/Metamask'
import { Errors } from '../../util/Constants'

import { TransactOpts } from '@computable/computablejs/dist/interfaces/contract'
import Deployed from '@computable/computablejs/dist/abstracts/deployed'
import { call, buildTransaction } from '@computable/computablejs/dist/helpers'

import Web3 from 'web3'
import { Transaction } from 'web3/types'

export default class ProtocolSuper {

  protected web3!: Web3
  protected transactOpts: TransactOpts

  constructor() {
    this.transactOpts = {}
  }

  public async init(web3: Web3) {
    throw new Error(Errors.ABSTRACT_METHOD)
  }

  protected buildTransactionParameters(unsigned: Transaction): TransactionParameters {
    return {
      nonce: unsigned.nonce,
      gasPrice: `0x${Number(unsigned.gasPrice).toString(16)}`,
      gasLimit: `0x${unsigned.gas.toString(16)}`,
      to: this.contractAddress,
      from: ethereum.selectedAddress,
      value: '0x00',
      data: unsigned.data,
    }
  }

  protected async sendTransaction(
    method: [Transaction, TransactOpts],
    callback: (result: any, error: any) => void): Promise<string> {

    const unsigned = await buildTransaction(this.web3, method)
    console.log(unsigned)

    const transactionParameters = this.buildTransactionParameters(unsigned)
    console.log(transactionParameters)

    const rpcRequest: RpcRequest = {
      method: 'eth_sendTransaction',
      params: [transactionParameters],
      from: ethereum.selectedAddress,
    }
    console.log(rpcRequest)

    const enabledAccount = await enable()
    if (typeof enabledAccount !== 'string') {
      throw new Error(Errors.METAMASK_NOT_ENABLED)
    }

    ethereum.sendAsync(rpcRequest, callback)
    return enabledAccount
  }

  public get abi(): any[] {
    throw new Error(Errors.ABSTRACT_METHOD)
  }

  protected get contractAddress(): string {
    throw new Error(Errors.ABSTRACT_METHOD)
  }

  // TODO: Figure out if there's a way to make this work
  protected get deployed(): Deployed {
    throw new Error(Errors.ABSTRACT_METHOD)
  }
}
