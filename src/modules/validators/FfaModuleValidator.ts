// tslint:disable member-ordering

import Validatable from 'interfaces/validation/Validatable'
import FfaModuleValidation from './FfaModuleValidation'
import FfaFieldValidation from './FfaFieldValidation'
import { Store } from 'vuex'
import PropertyAccessibleModule from 'modules/PropertyAccessibleModule'
import Indexable from 'interfaces/Indexable'

/**
 * Superclass of all Ffa Vuex Module _Validators_
 */
export default class FfaModuleValidator implements Validatable {

  public state!: Indexable
  protected vuexStore!: Store<any>

  constructor(state: PropertyAccessibleModule, vuexStore: Store<any>) {
    this.state = state
    this.vuexStore = vuexStore
  }

  public validate(): FfaModuleValidation {
    const validation = new FfaModuleValidation('uploadModule')
    validation.fieldValidations = this.getProperties().map((prop) => this.validateField(prop))
    return validation
  }

  protected validateField(field: string): FfaFieldValidation {
    return new FfaFieldValidation(field)
  }

  protected getProperties(): string[] {
    return Object.getOwnPropertyNames(this.state).filter((name) => !name.startsWith('__') )
  }
}
