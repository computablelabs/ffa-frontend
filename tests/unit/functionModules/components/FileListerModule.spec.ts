import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'

import FileListerModule from '../../../../src/functionModules/components/FileListerModule'

import AppModule from '../../../../src/vuexModules/AppModule'
import FlashesModule from '../../../../src/vuexModules/FlashesModule'
import UploadModule from '../../../../src/vuexModules/UploadModule'
import NewListingModule from '../../../../src/vuexModules/NewListingModule'

import { Eventable } from '../../../../src/interfaces/Eventable'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'

import Web3 from 'web3'

describe('FileListerModule.ts', () => {

  const txId = '0xwhatever'
  const successEvent: Eventable = {
    timestamp: new Date().getTime(),
    response: {
      result: txId,
    },
  }

  let appModule!: AppModule
  let flashesModule!: FlashesModule
  let newListingModule!: NewListingModule
  let uploadModule!: UploadModule

  beforeAll(() => {
    appModule = getModule(AppModule, appStore)
    appModule.initializeWeb3('http://localhost:8545')
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


      FileListerModule.success(successEvent, appStore)

      expect(flashesModule.flashes.length).toBe(1)
      expect(newListingModule.transactionHash).toEqual(txId)
      expect(newListingModule.percentComplete).toBe(100)
      expect(newListingModule.status).toEqual(ProcessStatus.Complete)
      expect(uploadModule.status).toEqual(ProcessStatus.Ready)
    })
  })
})
