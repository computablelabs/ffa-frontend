import { getModule } from 'vuex-module-decorators'
import TaggersModule from '../../../../src/modules/TaggersModule'
import appStore from '../../../../src/store'
import FfaTaggerModule from '../../../../src/functionModules/components/FfaTaggerModule'


describe('FfaTaggerModule.ts', () => {
  let taggersModule!: TaggersModule

  const testKey: string = 'testKey'
  const testValue: string = 'testinput'

  beforeAll(() => {
    taggersModule = getModule(TaggersModule, appStore)
  })

  describe('addTags()', () => {
    it('correctly adds tags', () => {
      FfaTaggerModule.addTags(taggersModule, `${testKey}`, `${testValue}`)
      expect(taggersModule.taggers[testKey]).toHaveLength(1)
      expect(taggersModule.taggers[testKey][0]).toEqual(testValue)
    })
  })
})
