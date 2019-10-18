import MarketTokenContract from '@computable/computablejs/dist/contracts/market-token'
import { call } from '@computable/computablejs/dist/helpers'

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

  public static async balanceOf(
    account: string,
    web3: Web3): Promise<string> {

    const marketToken = await MarketTokenContractModule.getMarketTokenContract(account, web3)
    const method = await marketToken.balanceOf(account)
    return await call(method)
  }

  public static async approve(
    account: string,
    web3: Web3,
    spender: string,
    amount: string,
    processId: string,
    appStore: Store<any>) {
    const marketToken = await MarketTokenContractModule.getMarketTokenContract(account, web3)
    const method = await marketToken.approve(spender, amount)

    MetamaskModule.buildAndSendTransaction(
      account, method, ContractAddresses.MarketTokenAddress, processId, appStore)
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
