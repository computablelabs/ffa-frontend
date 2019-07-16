import { ProcessStatus } from './ProcessStatus'
export default interface FfaProcessModule {
  namespace: string
  processStatus: ProcessStatus
  percentComplete: number
  reset(): void
  prepare(target: any): void
  setStatus(status: ProcessStatus): void
  setPercentComplete(percentComplete: number): void
}
