import { ProcessStatus } from '../../models/ProcessStatus'

export default class ProcessStatusModule {

  public static toEnumValue(mutationPayload: any): ProcessStatus {
    const index = Number(mutationPayload)
    const key = ProcessStatus[index] as keyof typeof ProcessStatus
    return ProcessStatus[key]
  }
}
