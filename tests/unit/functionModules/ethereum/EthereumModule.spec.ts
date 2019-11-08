import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'

import EthereumModule from '../../../../src/functionModules/ethereum/EthereumModule'
import MetamaskModule from '../../../../src/functionModules/metamask/MetamaskModule'
import ParameterizerModule from '../../../../src/functionModules/protocol/ParameterizerContractModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'
import ReserveContractModule from '../../../../src/functionModules/protocol/ReserveContractModule'

import Servers from '../../../../src/util/Servers'

import Web3 from 'web3'
import {BlockType} from 'web3/types'
import BigNumber from 'bignumber.js'

// tslint:disable no-shadowed-variable
describe('FileUploaderModule.ts', () => {

  const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'

  let appModule!: AppModule

  const web3 = new Web3(Servers.EthereumJsonRpcProvider!)
  const gethProvider = web3.currentProvider

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)

    MetamaskModule.enable = (): Promise<string|Error> => {
      return Promise.resolve('foo')
    }
  })

  beforeEach(() => {
    appModule.setAppReady(false)
  })

  afterEach(() => {
    (window as any).ethereum = {}
    ethereum.selectedAddress = fakeRealAddress
  })

  describe('setEthereum', () => {
    it('correctly does nothing', async () => {
      appModule.disconnectWeb3()
      ethereum.selectedAddress = ''
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(appModule)).toBeFalsy()
      await EthereumModule.setEthereum(false, false, false, appStore)
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(appModule)).toBeFalsy()
      expect(appModule.appReady).toBeTruthy()
    })

    it('correctly requires web3', async () => {
      appModule.disconnectWeb3()
      ethereum.selectedAddress = ''
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(appModule)).toBeFalsy()
      await EthereumModule.setEthereum(true, false, false, appStore)
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(appModule)).toBeTruthy()
      expect(appModule.appReady).toBeTruthy()
    })

    it('correctly doesn\'t initialize web3 when web3 exists', async () => {
      ethereum.selectedAddress = ''
      appModule.initializeWeb3(gethProvider)
      AppModule.mutations!.initializeWeb3 = jest.fn((provider: any) => {
        return true
      })
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(appModule)).toBeTruthy()
      await EthereumModule.setEthereum(true, false, false, appStore)
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(appModule)).toBeTruthy()
      expect(AppModule.mutations!.initializeWeb3).not.toHaveBeenCalled()
      expect(appModule.appReady).toBeTruthy()
    })

    it('correctly doesn\'t initialize web3 when metamask exists', async () => {
      appModule.initializeWeb3(gethProvider)
      AppModule.mutations!.initializeWeb3 = jest.fn((provider: any) => {
        return true
      })
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeTruthy()
      expect(EthereumModule.isWeb3Defined(appModule)).toBeTruthy()
      await EthereumModule.setEthereum(true, false, false, appStore)
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeTruthy()
      expect(EthereumModule.isWeb3Defined(appModule)).toBeTruthy()
      expect(AppModule.mutations!.initializeWeb3).not.toHaveBeenCalled()
      expect(appModule.appReady).toBeTruthy()
    })

    it('correctly requires metamask', async () => {
      appModule.disconnectWeb3()
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeFalsy();
      (window as any).ethereum = gethProvider
      ethereum.selectedAddress = fakeRealAddress
      await EthereumModule.setEthereum(false, true, false, appStore)
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeTruthy()
      expect(appModule.areParametersSet).toBeFalsy()
      expect(appModule.appReady).toBeTruthy()
    })

    it('correctly requires parameters', async () => {

      ParameterizerModule.getParameters = jest.fn(
        (web3: Web3): Promise<string[]> => {
        return Promise.resolve(['1', '1', '1', '1', '1', '1'])
      })

      EtherTokenContractModule.balanceOf = jest.fn((
        account: string, web3: Web3): Promise<string> => {
        return Promise.resolve('1')
      })

      MarketTokenContractModule.balanceOf = jest.fn(
        (account: string, web3: Web3): Promise<string> => {
        return Promise.resolve('10')
      })

      ReserveContractModule.getSupportPrice =  jest.fn(
        (account: string, web3: Web3) => {
        return Promise.resolve('50000')
      })

      appModule.web3.eth.getBalance = jest.fn(
        (account: string): Promise<string> => {
          return Promise.resolve('100')
      })

      appModule.disconnectWeb3()
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeFalsy();
      (window as any).ethereum = gethProvider
      ethereum.selectedAddress = fakeRealAddress
      expect(appModule.areParametersSet).toBeFalsy()
      await EthereumModule.setEthereum(false, false, true, appStore)
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeTruthy()
      expect(EthereumModule.isWeb3Defined(appModule)).toBeTruthy()
      expect(appModule.areParametersSet).toBeTruthy()
      expect(appModule.appReady).toBeTruthy()
      expect(appModule.canVote).toBeTruthy()
    })
  })

  describe('isMetamaskConnected', () => {
    it('correctly return true', () => {
      ethereum.selectedAddress = fakeRealAddress
      appModule.initializeWeb3(Servers.EthereumJsonRpcProvider!)
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeTruthy()
    })

    it('correctly return false', () => {
      ethereum.selectedAddress = ''
      appModule.initializeWeb3(Servers.EthereumJsonRpcProvider!)
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeFalsy()
      ethereum.selectedAddress = fakeRealAddress
      appModule.disconnectWeb3()
      expect(EthereumModule.isMetamaskConnected(appModule)).toBeFalsy()
    })
  })

  describe('isWeb3Defined', () => {
    it('correctly return true when defined', () => {
      appModule.initializeWeb3(Servers.EthereumJsonRpcProvider!)
      expect(EthereumModule.isWeb3Defined(appModule)).toBeTruthy()
    })

    it('correctly return false when undefined', () => {
      appModule.disconnectWeb3()
      expect(EthereumModule.isWeb3Defined(appModule)).toBeFalsy()
    })
  })

  describe('ethereumDisabled()', () => {
    it('correctly tests the global/window ethereum object', () => {
      ethereum.selectedAddress = fakeRealAddress
      expect(ethereum.selectedAddress).toEqual( fakeRealAddress)
      expect(EthereumModule.ethereumDisabled()).toBeFalsy()
      ethereum.selectedAddress = ''
      expect(EthereumModule.ethereumDisabled()).toBeTruthy()
    })
  })

  describe('setParameters()', () => {
    it ('correctly sets parameters', async () => {
      appModule.initializeWeb3(gethProvider)

      appModule.setMakerPayment(-1)
      appModule.setCostPerByte(-1)
      appModule.setStake(-1)
      appModule.setPriceFloor(-1)
      appModule.setPlurality(-1)
      appModule.setVoteBy(-1)
      appModule.setMarketTokenBalance(-1)
      appModule.setEtherTokenDatatrustAllowance(-1)
      appModule.setSupportPrice(-1)

      ParameterizerModule.getParameters = jest.fn(
        (web3: Web3): Promise<string[]> => {
        return Promise.resolve(['1', '1', '1', '1', '1', '1'])
      })

      MarketTokenContractModule.balanceOf = jest.fn(
        (account: string, web3: Web3): Promise<string> => {
        return Promise.resolve('10')
      })

      EtherTokenContractModule.allowance = jest.fn(
        (account: string, contractAddress: string, wen3: Web3): Promise<string> => {
        return Promise.resolve('100')
      })

      MarketTokenContractModule.allowance = jest.fn(
        (account: string, contractAddress: string, wen3: Web3): Promise<string> => {
        return Promise.resolve('100')
      })

      ReserveContractModule.getSupportPrice =  jest.fn(
        (account: string, web3: Web3) => {
        return Promise.resolve('50000')
      })

      appModule.web3.eth.getBalance = jest.fn(
        (address: string) => {
        return Promise.resolve('10')
      })

      expect(appModule.areParametersSet).toBeFalsy()
      await EthereumModule.setParameters(appStore)
      expect(appModule.areParametersSet).toBeTruthy()
    })
  })

  describe('weiToEther()', () => {
    it ('converts large amounts of number wei', () => {
      const wei = 4000000000 * 40000000000
      expect(EthereumModule.weiToEther(wei, web3)).toBe('160')
    })

    it ('converts large amounts of BigNumber wei', () => {
      const wei = new BigNumber(4000000000 * 40000000000)
      expect(EthereumModule.weiToEther(wei, web3)).toBe('160')
    })

  })
})
