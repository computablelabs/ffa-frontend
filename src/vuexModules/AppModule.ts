import {
  Module,
  VuexModule,
  Mutation,
  MutationAction } from 'vuex-module-decorators'

@Module({ namespaced: true, name: 'appModule' })
export default class AppModule extends VuexModule {

  public appReady: boolean = false
  public makerPayment!: number
  public costPerByte!: number
  public stake!: number
  public priceFloor!: number
  public plurality!: number
  public voteBy!: number

  @Mutation
  public setAppReady(appReady: boolean) {
    this.appReady = appReady
  }

  @Mutation
  public setMakerPayment(makerPayment: number) {
    this.makerPayment = makerPayment
  }

  @Mutation
  public setCostPerByte(costPerByte: number) {
    this.costPerByte = costPerByte
  }

  @Mutation
  public setStake(stake: number) {
    this.stake = stake
  }

  @Mutation
  public setPriceFloor(priceFloor: number) {
    this.priceFloor = priceFloor
  }

  @Mutation
  public setPlurality(plurality: number) {
    this.plurality = plurality
  }

  @Mutation
  public setVoteBy(voteBy: number) {
    this.voteBy = voteBy
  }
}
