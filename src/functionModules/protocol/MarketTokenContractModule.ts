import MarketTokenContract from '@computable/computablejs/dist/contracts/market-token'
import { call } from '@computable/computablejs/dist/helpers'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import ContractAddresses from '../../models/ContractAddresses'
import { Errors } from '../../util/Constants'
import { Store } from 'vuex'

import Web3 from 'web3'
import MetamaskModule from '../../functionModules/metamask/MetamaskModule'

export default class MarketTokenContractModule {

  public static async getMarketTokenContract(account: string, web3: Web3): Promise<MarketTokenContract> {
    const marketToken = new MarketTokenContract(account)
    const initialized = await marketToken.at(web3, ContractAddresses.MarketTokenAddress)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return marketToken
  }

  public static async getBalance(
    account: string,
    web3: Web3,
    transactOpts: TransactOpts): Promise<string> {

    const marketToken = await MarketTokenContractModule.getMarketTokenContract(account, web3)
    const method = await marketToken.balanceOf(account, transactOpts)
    return await call(method)
  }

  public static async approve(
    account: string,
    web3: Web3,
    spender: string,
    amount: string,
    appStore: Store<any>,
    success: (
      response: any,
      appStore: Store<any>) => void) {
    const marketToken = await MarketTokenContractModule.getMarketTokenContract(account, web3)
    const method = await marketToken.approve(spender, amount)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.MarketTokenAddress, appStore, success)
    }

  public static async allowance(
    account: string,
    web3: Web3,
    owner: string,
    spender: string): Promise<string> {
    const marketToken = await MarketTokenContractModule.getMarketTokenContract(account, web3)
    const method = await marketToken.allowance(owner, spender)
    return await call(method)
    }
}
