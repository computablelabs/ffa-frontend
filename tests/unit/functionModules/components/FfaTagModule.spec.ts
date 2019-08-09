import { getModule } from 'vuex-module-decorators'
import FfaTagModule from '../../../../src/functionModules/components/FfaTagModule'
import TaggersModule from '../../../../src/vuexModules/TaggersModule'
import appStore from '../../../../src/store'

describe('FfaTagModule.ts', () => {
  let taggersModule!: TaggersModule
  const testTagKey = 'test'

  beforeAll(() => {
    taggersModule = getModule(TaggersModule, appStore)
  })

  it('correctly deletes tags', () => {
    taggersModule.addTag('test:tag')
    FfaTagModule.deleteTag(taggersModule, 'test', 'tag')
    expect(taggersModule.taggers[testTagKey]).toHaveLength(0)
    expect(taggersModule.taggers[testTagKey]).toEqual([])
  })
})
