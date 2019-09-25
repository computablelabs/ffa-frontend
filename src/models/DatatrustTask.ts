import Storeable from '../interfaces/Storeable'

import DatatrustTaskDetails from './DatatrustTaskDetails'

export default class DatatrustTask implements Storeable {
  public key: string
  public payload: DatatrustTaskDetails

  constructor(key: string, payload: DatatrustTaskDetails) {
    this.key = key
    this.payload = payload
  }
}
