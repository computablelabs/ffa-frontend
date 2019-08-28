import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../src/vuexModules/AppModule'
import appStore from '../../../src/store'

describe('AppModule.ts', () => {
  it('correctly returns appReady computed property', () => {
    const module = getModule(AppModule, appStore)
    expect(module.appReady).toBeFalsy()
    module.setMakerPayment(0)
    module.setCostPerByte(1)
    module.setStake(2)
    module.setPriceFloor(3)
    module.setPlurality(4)
    expect(module.appReady).toBeFalsy()
    module.setVoteBy(5)
    expect(module.appReady).toBeTruthy()
  })

  it('correctly returns sets ethereumEnabled', () => {
    const module = getModule(AppModule, appStore)
    expect(module.ethereumEnabled).toBeFalsy()
    module.setEthereumEnabled(true)
    expect(module.ethereumEnabled).toBeTruthy()
  })
})
