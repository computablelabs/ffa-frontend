import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'

import FileListerModule from '../../../../src/functionModules/components/FileListerModule'

import Web3Module from '../../../../src/vuexModules/Web3Module'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'
import UploadModule from '../../../../src/vuexModules/UploadModule'
import NewListingModule from '../../../../src/vuexModules/NewListingModule'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'

import Web3 from 'web3'

describe('FileListerModule.ts', () => {
  let web3Module!: Web3Module
  let flashesModule!: FlashesModule
  let newListingModule!: NewListingModule
  let uploadModule!: UploadModule


  beforeAll(() => {
    web3Module = getModule(Web3Module, appStore)
    web3Module.initialize('http://localhost:8545')
    flashesModule = getModule(FlashesModule, appStore)
    newListingModule = getModule(NewListingModule, appStore)
    uploadModule = getModule(UploadModule, appStore)
 })

  describe('success()', () => {
    it('correctly processes success response and set proper states', () => {

      expect(flashesModule.flashes.length).toBe(0)
      expect(newListingModule.transactionHash).toEqual('')
      expect(newListingModule.percentComplete).toBe(0)
      expect(newListingModule.status).toEqual(ProcessStatus.NotReady)
      expect(uploadModule.status).toEqual(ProcessStatus.NotReady)

      FileListerModule.success({result: '0xwhatever'}, appStore)

      expect(flashesModule.flashes.length).toBe(1)
      expect(newListingModule.transactionHash).toEqual('0xwhatever')
      expect(newListingModule.percentComplete).toBe(100)
      expect(newListingModule.status).toEqual(ProcessStatus.Complete)
      expect(uploadModule.status).toEqual(ProcessStatus.Ready)
    })
  })
})
