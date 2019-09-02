import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../src/vuexModules/AppModule'
import appStore from '../../../src/store'

describe('AppModule.ts', () => {
  it('correctly returns areParametersSet computed property', () => {
    const module = getModule(AppModule, appStore)
    expect(module.areParametersSet).toBeFalsy()
    module.setMakerPayment(0)
    module.setCostPerByte(1)
    module.setStake(2)
    module.setPriceFloor(3)
    module.setPlurality(4)
    expect(module.areParametersSet).toBeFalsy()
    module.setVoteBy(5)
    expect(module.areParametersSet).toBeTruthy()
  })

  it('correctly returns sets appReady', () => {
    const module = getModule(AppModule, appStore)
    expect(module.appReady).toBeFalsy()
    module.setAppReady(true)
    expect(module.appReady).toBeTruthy()
  })
})
