import uuid4 from 'uuid/v4'

export enum FlashType {
  warning = 'warning',
  error = 'danger',
  success = 'success',
  info = 'info',
}

export default class Flash {
  public readonly id: string
  public readonly message: string
  public readonly type: FlashType
  // maybe viewed flashes can remain in state?
  // public viewed: boolean

  constructor(message: string, type: FlashType) {
    this.id = uuid4()
    this.message = message
    this.type = type
    // this.viewed = false
  }
}
