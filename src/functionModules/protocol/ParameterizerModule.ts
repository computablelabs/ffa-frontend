import ContractAddresses from '../../models/ContractAddresses'
import ParameterizerContract from '@computable/computablejs/dist/contracts/parameterizer'
import { call } from '@computable/computablejs/dist/helpers'
import { Errors, ZERO_HASHED } from '../../util/Constants'
import Web3 from 'web3'
import Web3Module from 'vuexModules/Web3Module'
import { TransactOpts } from '@computable/computablejs/dist/interfaces'

export default class ParameterizerModule {

  public static async getParameterizer(account: string, web3: Web3): Promise<ParameterizerContract> {
    const parameterizer = new ParameterizerContract(account)
    const initialized = await parameterizer.at(web3, ContractAddresses.P11rAddress)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return parameterizer
  }

  public static async getMakerPayment(account: string,
                                      web3Module: Web3Module,
                                      transactOpts: TransactOpts) {
    const parameterizer = await ParameterizerModule.getParameterizer(account, web3Module.web3)
    const method = await parameterizer.getMakerPayment(transactOpts)
    return await call(method)
  }

  public static async getCostPerByte(account: string,
                                     web3Module: Web3Module,
                                     transactOpts: TransactOpts) {
    const parameterizer = await ParameterizerModule.getParameterizer(account, web3Module.web3)
    const method = await parameterizer.getCostPerByte(transactOpts)
    return await call(method)
  }

  public static async getStake(account: string,
                               web3Module: Web3Module,
                               transactOpts: TransactOpts) {
    const parameterizer = await ParameterizerModule.getParameterizer(account, web3Module.web3)
    const method = await parameterizer.getStake(transactOpts)
    return await call(method)
  }

  public static async getPriceFloor(account: string,
                                    web3Module: Web3Module,
                                    transactOpts: TransactOpts) {
    const parameterizer = await ParameterizerModule.getParameterizer(account, web3Module.web3)
    const method = await parameterizer.getPriceFloor(transactOpts)
    return await call(method)
  }

  public static async getPlurality(account: string,
                                   web3Module: Web3Module,
                                   transactOpts: TransactOpts) {
    const parameterizer = await ParameterizerModule.getParameterizer(account, web3Module.web3)
    const method = await parameterizer.getPlurality(transactOpts)
    return await call(method)
  }

  public static async getVoteBy(account: string,
                                web3Module: Web3Module,
                                transactOpts: TransactOpts) {
    const parameterizer = await ParameterizerModule.getParameterizer(account, web3Module.web3)
    const method = await parameterizer.getVoteBy(transactOpts)
    return await call(method)
  }
}
