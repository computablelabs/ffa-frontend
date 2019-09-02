import {
  Module,
  VuexModule,
  Mutation,
  MutationAction} from 'vuex-module-decorators'
import { getModule } from 'vuex-module-decorators'
import Web3Module from './Web3Module'
import ParameterizerModule from '../functionModules/protocol/ParameterizerModule'

@Module({ namespaced: true, name: 'appModule' })
export default class AppModule extends VuexModule {

  public appReady: boolean = false
  public makerPayment: number = -1
  public costPerByte: number = -1
  public stake: number = -1
  public priceFloor: number = -1
  public plurality: number = -1
  public voteBy: number = -1

  public get areParametersSet(): boolean {
    return this.makerPayment > -1 &&
           this.costPerByte > -1 &&
           this.stake > -1 &&
           this.priceFloor > -1 &&
           this.plurality > -1 &&
           this.voteBy > -1
  }

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
