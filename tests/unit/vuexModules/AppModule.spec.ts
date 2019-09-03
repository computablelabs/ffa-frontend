import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../src/vuexModules/AppModule'
import appStore from '../../../src/store'

describe('AppModule.ts', () => {
  it('correctly returns areParametersSet computed property', () => {
    const appModule = getModule(AppModule, appStore)
    expect(appModule.areParametersSet).toBeFalsy()
    appModule.setMakerPayment(0)
    appModule.setCostPerByte(1)
    appModule.setStake(2)
    appModule.setPriceFloor(3)
    appModule.setPlurality(4)
    appModule.setMarketTokenBalance(5)
    expect(appModule.areParametersSet).toBeFalsy()
    appModule.setVoteBy(5)
    expect(appModule.areParametersSet).toBeTruthy()
  })

  it('correctly mutates appReady', () => {
    const appModule = getModule(AppModule, appStore)
    expect(appModule.appReady).toBeFalsy()
    appModule.setAppReady(true)
    expect(appModule.appReady).toBeTruthy()
  })

  it('correctly computes canVote', () => {
    const appModule = getModule(AppModule, appStore)
    appModule.setStake(-1)
    appModule.setMarketTokenBalance(-1)
    expect(appModule.canVote).toBeFalsy()
    appModule.setStake(10)
    expect(appModule.canVote).toBeFalsy()
    appModule.setMarketTokenBalance(5)
    expect(appModule.canVote).toBeFalsy()
    appModule.setMarketTokenBalance(10)
    expect(appModule.canVote).toBeFalsy()
    appModule.setMarketTokenBalance(100)
    expect(appModule.canVote).toBeTruthy()
  })
})
