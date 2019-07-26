import Validatable from '../../interfaces/validation/Validatable'
import FfaModuleValidation from './FfaModuleValidation'
import FfaFieldValidation from './FfaFieldValidation'
import { Store } from 'vuex'

/**
 * Superclass of all Ffa Vuex Module _Validators_
 */
export default class FfaFieldValidator implements Validatable {

  public field!: string
  public value!: any
  protected vuexStore!: Store<any>

  constructor(field: string, value: any, vuexStore: Store<any>) {
    this.field = field
    this.value = value
    this.vuexStore = vuexStore
  }

  public validate(): FfaFieldValidation {
    const validation = new FfaFieldValidation(this.field)
    return validation
  }
}
