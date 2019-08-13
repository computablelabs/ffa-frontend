import { ProcessStatus } from '../../models/ProcessStatus'

export default interface FfaProcessModule {
  readonly namespace: string
  status: ProcessStatus
  percentComplete: number
  reset(): void
  prepare(target: any): void
  setStatus(status: ProcessStatus): void
  setPercentComplete(percentComplete: number): void

}
