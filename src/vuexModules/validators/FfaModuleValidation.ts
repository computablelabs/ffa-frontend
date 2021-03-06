import Validation from 'interfaces/validation/Validation'
import FfaFieldValidator from './FfaFieldValidation'

/**
 * Represents the _result_ of validating an Ffa Vuex Module
 */
export default class FfaModuleValidation implements Validation {
  public module!: string
  public fieldValidations: FfaFieldValidator[] = []

  constructor(module: string) {
    this.module = module
  }

  public get valid(): boolean {
    return this.fieldValidations.every((fv) => fv.valid)
  }
}
