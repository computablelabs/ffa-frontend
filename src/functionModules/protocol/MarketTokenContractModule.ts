import MarketTokenContract from '@computable/computablejs/dist/contracts/market-token'
import { call } from '@computable/computablejs/dist/helpers'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

import ContractAddresses from '../../models/ContractAddresses'
import { Errors } from '../../util/Constants'

import Web3 from 'web3'

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
    transactOpts: TransactOpts) {

    const marketToken = await MarketTokenContractModule.getMarketTokenContract(account, web3)
    const method = await marketToken.balanceOf(account, transactOpts)
    return await call(method)
  }
}
