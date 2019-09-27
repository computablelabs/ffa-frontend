import { Eventable } from '../../interfaces/Eventable'

export default class EventableModule {

  public static isEventable(object: any): object is Eventable {
    return (object as Eventable).log !== undefined ||
      (object as Eventable).response !== undefined ||
      (object as Eventable).error !== undefined
  }

  public static isError(object: any): object is Eventable {
    return (object as Eventable).error !== undefined
  }
}
