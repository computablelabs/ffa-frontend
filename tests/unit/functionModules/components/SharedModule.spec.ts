import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'

import UploadModule from '../../../../src/vuexModules/UploadModule'
import AppModule from '../../../../src/vuexModules/AppModule'

import SharedModule from '../../../../src/functionModules/components/SharedModule'
import MetamaskModule from '../../../../src/functionModules/metamask/MetamaskModule'
import { enableEthereum } from 'util/Metamask'
import Servers from '../../../../src/util/Servers'

let appModule!: AppModule

const fakeRealAddress = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'
describe('ShareModule.ts', () => {
  beforeAll(() => {
    ethereum.selectedAddress = fakeRealAddress
    appModule = getModule(AppModule, appStore)
  })

  describe('SharedModule::isReady', () => {
    it('returns ready correctly', () => {
      let isReady = SharedModule.isReady(true, appStore)
      expect(isReady).toBeFalsy()

      setAppParams()
      isReady = SharedModule.isReady(true, appStore)
      expect(isReady).toBeTruthy()

      isReady = SharedModule.isReady(false, appStore)
      expect(isReady).toBeTruthy()
    })
  })

  describe('SharedModule::isAuthenticated', () => {
    it('returns the correct authentication', async () => {
      // @ts-ignore
      ethereum.isMetaMask = true

      let isAuthenticated = SharedModule.isAuthenticated(appStore)
      expect(isAuthenticated).toBeFalsy()

      appModule.initializeWeb3(Servers.EthereumJsonRpcProvider!)
      isAuthenticated = SharedModule.isAuthenticated(appStore)
      expect(isAuthenticated).toBeFalsy()

      appModule.setJwt('jwt')
      isAuthenticated = SharedModule.isAuthenticated(appStore)
      expect(isAuthenticated).toBeTruthy()
    })
  })
})

function setAppParams() {
  appModule.setMakerPayment(1)
  appModule.setCostPerByte(1)
  appModule.setStake(1)
  appModule.setPriceFloor(1)
  appModule.setPlurality(1)
  appModule.setVoteBy(1)
  appModule.setEtherTokenBalance(1)
  appModule.setMarketTokenBalance(1)
  appModule.setEtherTokenDatatrustAllowance(1)
  appModule.setEtherTokenReserveAllowance(1)
  appModule.setTotalMarketTokenSupply(1)
  appModule.setTotalReserveEtherTokenSupply(1)
  appModule.setSupportPrice(50000)
  appModule.setMarketTokenVotingContractAllowance(1)
}
