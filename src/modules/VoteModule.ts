import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'
import FfaProcessModule from './FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'

@Module({ namespaced: true, name: 'voteModule' })
export default class VoteModule extends VuexModule implements FfaProcessModule {
  public status: ProcessStatus = ProcessStatus.NotReady
  public percentComplete = 0
  public voteInFavor = false
  // @MutationAction({mutate: ['flashes']})
  // public async fetchAll() {
  //   const response = [{}] // : Response = await getJSON('https://hasgeek.github.io/events/api/events.json')
  //   return response
  // }

  @Mutation
  public reset() {
    this.status = ProcessStatus.NotReady
  }

  @Mutation
  public prepare(voteInFavor: boolean) {
    this.voteInFavor = voteInFavor
  }

  @Mutation
  public setPercentComplete(percentComplete: number) {
    this.percentComplete = percentComplete
  }

  @Mutation
  public setStatus(status: ProcessStatus) {
    this.status = status
  }

  // @Mutation
  // public nextStatus() {
  //   if (this.status === ProcessStatus.Error) {
  //     return
  //   }
  //   const currentStatusIndex = Number(this.status)
  //   const nextStatus = ProcessStatus[currentStatusIndex + 1] as keyof typeof ProcessStatus
  //   this.status = ProcessStatus[nextStatus]
  // }

  get namespace(): string {
    return 'voteModule'
  }

  get processStatus(): ProcessStatus {
    return this.status
  }
}
