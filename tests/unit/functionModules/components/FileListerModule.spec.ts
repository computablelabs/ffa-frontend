import FileListerModule from '../../../../src/functionModules/components/FileListerModule'
import ListModule from '../../../../src/modules/ListModule'
import FfaListingsModule from '../../../../src/modules/FfaListingsModule'
import Web3Module from '../../../../src/modules/Web3Module'
import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'

describe('FileListerModule.ts', () => {
  let listModule!: ListModule
  let web3Module!: Web3Module
  let ffaListingsModule!: FfaListingsModule

  beforeAll(() => {
    listModule = getModule(ListModule, appStore)
    web3Module = getModule(Web3Module, appStore)
    ffaListingsModule = getModule(FfaListingsModule, appStore)
  })

  describe('list()', () => {
    it('correctly creates a listing', async () => {
      const web3 = web3Module.web3
      await FileListerModule.list(listModule, ffaListingsModule, web3)
      expect(listModule.percentComplete).toBe(50)
    })
  })
})
