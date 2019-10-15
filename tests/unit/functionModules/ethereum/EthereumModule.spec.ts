import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'

import EthereumModule from '../../../../src/functionModules/ethereum/EthereumModule'
import MetamaskModule from '../../../../src/functionModules/metamask/MetamaskModule'
import ParameterizerModule from '../../../../src/functionModules/protocol/ParameterizerContractModule'
import MarketTokenContractModule from '../../../../src/functionModules/protocol/MarketTokenContractModule'
import EtherTokenContractModule from '../../../../src/functionModules/protocol/EtherTokenContractModule'

import Servers from '../../../../src/util/Servers'

import Web3 from 'web3'

// tslint:disable no-shadowed-variable

describe('FileUploaderModule.ts', () => {

  const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'

  let appModule!: AppModule
  let web3Module!: Web3Module
  let flashesModule!: FlashesModule

  const w3 = new Web3(Servers.SkynetJsonRpc)
  const gethProvider = w3.currentProvider

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    web3Module = getModule(Web3Module, appStore)
    flashesModule = getModule(FlashesModule, appStore)

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
      web3Module.disconnect()
      ethereum.selectedAddress = ''
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeFalsy()
      await EthereumModule.setEthereum(false, false, false, appStore)
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeFalsy()
      expect(appModule.appReady).toBeTruthy()
    })

    it('correctly requires web3', async () => {
      web3Module.disconnect()
      ethereum.selectedAddress = ''
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeFalsy()
      await EthereumModule.setEthereum(true, false, false, appStore)
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeTruthy()
      expect(appModule.appReady).toBeTruthy()
    })

    it('correctly doesn\'t initialize web3 when web3 exists', async () => {
      ethereum.selectedAddress = ''
      web3Module.initialize(gethProvider)
      Web3Module.mutations!.initialize = jest.fn((provider: any) => {
        return true
      })
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeTruthy()
      await EthereumModule.setEthereum(true, false, false, appStore)
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeFalsy()
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeTruthy()
      expect(Web3Module.mutations!.initialize).not.toHaveBeenCalled()
      expect(appModule.appReady).toBeTruthy()
    })

    it('correctly doesn\'t initialize web3 when metamask exists', async () => {
      web3Module.initialize(gethProvider)
      Web3Module.mutations!.initialize = jest.fn((provider: any) => {
        return true
      })
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeTruthy()
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeTruthy()
      await EthereumModule.setEthereum(true, false, false, appStore)
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeTruthy()
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeTruthy()
      expect(Web3Module.mutations!.initialize).not.toHaveBeenCalled()
      expect(appModule.appReady).toBeTruthy()
    })

    it('correctly requires metamask', async () => {
      web3Module.disconnect()
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeFalsy();
      (window as any).ethereum = gethProvider
      ethereum.selectedAddress = fakeRealAddress
      await EthereumModule.setEthereum(false, true, false, appStore)
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeTruthy()
      expect(appModule.areParametersSet).toBeFalsy()
      expect(appModule.appReady).toBeTruthy()
    })

    it('correctly requires parameters', async () => {

      ParameterizerModule.getParameters = async (web3: Web3): Promise<string[]> => {
        return Promise.resolve(['1', '1', '1', '1', '1', '1'])
      }

      MarketTokenContractModule.getBalance =
        async (account: string, web3: Web3): Promise<string> => {
        return Promise.resolve('10')
      }

      web3Module.disconnect()
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeFalsy();
      (window as any).ethereum = gethProvider
      ethereum.selectedAddress = fakeRealAddress
      expect(appModule.areParametersSet).toBeFalsy()
      await EthereumModule.setEthereum(false, false, true, appStore)
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeTruthy()
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeTruthy()
      expect(appModule.areParametersSet).toBeTruthy()
      expect(appModule.appReady).toBeTruthy()
      expect(appModule.canVote).toBeTruthy()
    })
  })

  describe('isMetamaskConnected', () => {
    it('correctly return true', () => {
      ethereum.selectedAddress = fakeRealAddress
      web3Module.initialize(Servers.SkynetJsonRpc)
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeTruthy()
    })

    it('correctly return false', () => {
      ethereum.selectedAddress = ''
      web3Module.initialize(Servers.SkynetJsonRpc)
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeFalsy()
      ethereum.selectedAddress = fakeRealAddress
      web3Module.disconnect()
      expect(EthereumModule.isMetamaskConnected(web3Module)).toBeFalsy()
    })
  })

  describe('isWeb3Defined', () => {
    it('correctly return true when defined', () => {
      web3Module.initialize(Servers.SkynetJsonRpc)
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeTruthy()
    })

    it('correctly return false when undefined', () => {
      web3Module.disconnect()
      expect(EthereumModule.isWeb3Defined(web3Module)).toBeFalsy()
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

      appModule.setMakerPayment(-1)
      appModule.setCostPerByte(-1)
      appModule.setStake(-1)
      appModule.setPriceFloor(-1)
      appModule.setPlurality(-1)
      appModule.setVoteBy(-1)
      appModule.setMarketTokenBalance(-1)
      appModule.setDatatrustContractAllowance(-1)

      ParameterizerModule.getParameters = async (web3: Web3): Promise<string[]> => {
        return Promise.resolve(['1', '1', '1', '1', '1', '1'])
      }

      MarketTokenContractModule.getBalance =
        async (account: string, web3: Web3): Promise<string> => {
        return Promise.resolve('10')
      }

      EtherTokenContractModule.allowance =
        async (account: string, contractAddress: string, wen3: Web3): Promise<string> => {
        return Promise.resolve('100')
      }

      expect(appModule.areParametersSet).toBeFalsy()
      await EthereumModule.setParameters(appStore)
      expect(appModule.areParametersSet).toBeTruthy()
    })
  })
})
