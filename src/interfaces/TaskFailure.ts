import { AxiosResponse } from 'axios'

export default interface TaskFailure {
  uuid: string
  response?: AxiosResponse
  error?: Error
}
