import ParameterizerContract from '@computable/computablejs/dist/contracts/parameterizer'
import { call } from '@computable/computablejs/dist/helpers'

import ContractAddresses from '../../models/ContractAddresses'
import { Errors } from '../../util/Constants'

import Web3 from 'web3'

export default class ParameterizerContractModule {

  public static async getParameterizer(account: string, web3: Web3): Promise<ParameterizerContract> {
    const parameterizer = new ParameterizerContract(account)
    const initialized = await parameterizer.at(web3, ContractAddresses.ParameterizerAddress)
    if (!initialized) {
      throw new Error(Errors.HOC_AT_FAILED)
    }
    return parameterizer
  }

  public static async getMakerPayment(
    account: string,
    web3: Web3) {

    const parameterizer = await ParameterizerContractModule.getParameterizer(account, web3)
    const method = await parameterizer.getMakerPayment()
    return await call(method)
  }

  public static async getCostPerByte(
    account: string,
    web3: Web3) {

    const parameterizer = await ParameterizerContractModule.getParameterizer(account, web3)
    const method = await parameterizer.getCostPerByte()
    return await call(method)
  }

  public static async getStake(
    account: string,
    web3: Web3) {

    const parameterizer = await ParameterizerContractModule.getParameterizer(account, web3)
    const method = await parameterizer.getStake()
    return await call(method)
  }

  public static async getPriceFloor(
    account: string,
    web3: Web3) {

    const parameterizer = await ParameterizerContractModule.getParameterizer(account, web3)
    const method = await parameterizer.getPriceFloor()
    return await call(method)
  }

  public static async getPlurality(
    account: string,
    web3: Web3) {

    const parameterizer = await ParameterizerContractModule.getParameterizer(account, web3)
    const method = await parameterizer.getPlurality()
    return await call(method)
  }

  public static async getVoteBy(
    account: string,
    web3: Web3) {

    const parameterizer = await ParameterizerContractModule.getParameterizer(account, web3)
    const method = await parameterizer.getVoteBy()
    return await call(method)
  }

  public static async getParameters(web3: Web3): Promise<string[]> {
    return await Promise.all([
      ParameterizerContractModule.getMakerPayment(ethereum.selectedAddress, web3),
      ParameterizerContractModule.getCostPerByte(ethereum.selectedAddress, web3),
      ParameterizerContractModule.getStake(ethereum.selectedAddress, web3),
      ParameterizerContractModule.getPriceFloor(ethereum.selectedAddress, web3),
      ParameterizerContractModule.getPlurality(ethereum.selectedAddress, web3),
      ParameterizerContractModule.getVoteBy(ethereum.selectedAddress, web3),
    ])
  }
}
