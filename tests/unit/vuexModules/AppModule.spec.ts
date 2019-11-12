import { getModule } from 'vuex-module-decorators'
import AppModule from '../../../src/vuexModules/AppModule'
import appStore from '../../../src/store'

describe('AppModule.ts', () => {

  const appModule = getModule(AppModule, appStore)

  const oneG = 1000
  const oneBillion = oneG * oneG * oneG
  const dummySupportPrice = oneBillion
  const dummySupportPrice2 = oneBillion * 2
  const dummySupportPrice3 = oneBillion / 2

  it('correctly returns areParametersSet computed property', () => {
    expect(appModule.areParametersSet).toBeFalsy()
    appModule.setMakerPayment(0)
    appModule.setCostPerByte(1)
    appModule.setStake(2)
    appModule.setPriceFloor(3)
    appModule.setPlurality(4)
    appModule.setMarketTokenBalance(5)
    expect(appModule.areParametersSet).toBeFalsy()
    appModule.setVoteBy(5)
    appModule.setEtherTokenDatatrustAllowance(1)
    appModule.setTotalMarketTokenSupply(1)
    appModule.setTotalReserveEtherTokenSupply(1)
    appModule.setSupportPrice(dummySupportPrice)
    appModule.setEtherTokenBalance(1)
    appModule.setMarketTokenBalance(1)
    appModule.setEtherTokenReserveAllowance(1)
    appModule.setMarketTokenVotingContractAllowance(1)

    expect(appModule.areParametersSet).toBeTruthy()
  })

  it('correctly mutates appReady', () => {
    expect(appModule.appReady).toBeFalsy()
    appModule.setAppReady(true)
    expect(appModule.appReady).toBeTruthy()
  })

  it('correctly computes canVote', () => {
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

  it('correctly mutates other attributes', () => {
    expect(appModule.ethereumBalance).toBeLessThan(0)
    expect(appModule.ethereumToUSDRate).toBeLessThan(0)
    expect(appModule.jwt).toEqual('')

    appModule.setEthereumBalance(123.45)
    expect(appModule.ethereumBalance).toBe(123.45)
    appModule.setEthereumToUSDRate(234.56)
    expect(appModule.ethereumToUSDRate).toBe(234.56)
    appModule.setEtherTokenBalance(345.67)
    expect(appModule.etherTokenBalance).toBe(345.67)
    appModule.setSupportPrice(dummySupportPrice)
    expect(appModule.supportPrice).toBe(dummySupportPrice)
    appModule.setJWT('jwt')
    expect(appModule.jwt).toEqual('jwt')
  })

  it('correctly computes getter props', () => {

    appModule.setSupportPrice(-1)
    expect(appModule.marketTokenToEthereumRate).toBe(0)
    expect(appModule.ethereumToMarketTokenRate).toBe(0)
    expect(appModule.marketTokenToUSDRate).toBe(0)

    appModule.setSupportPrice(dummySupportPrice)
    expect(appModule.marketTokenToEthereumRate).toBe(1)
    expect(appModule.ethereumToMarketTokenRate).toBe(1)
    expect(appModule.marketTokenToUSDRate).toBe(234.56)

    appModule.setSupportPrice(dummySupportPrice2)
    expect(appModule.marketTokenToEthereumRate).toBe(2)
    expect(appModule.ethereumToMarketTokenRate).toBe(0.5)
    expect(appModule.marketTokenToUSDRate).toBe(117.28)

    appModule.setSupportPrice(dummySupportPrice3)
    expect(appModule.marketTokenToEthereumRate).toBe(0.5)
    expect(appModule.ethereumToMarketTokenRate).toBe(2)
    expect(appModule.marketTokenToUSDRate).toBe(469.12)
  })
})
