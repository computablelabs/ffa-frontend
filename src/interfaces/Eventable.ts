export interface Eventable {
  timestamp: number
  processId?: string
  log?: string
  response?: any
  error?: any
}
