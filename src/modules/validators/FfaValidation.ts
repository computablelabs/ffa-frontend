import { Validation } from 'global'
import FfaFieldValidation from './FfaFieldValidation'

export default class FfaValidation implements Validation {
  public module!: string
  public fieldValidations: FfaFieldValidation[] = []

  constructor(module: string) {
    this.module = module
  }

  public get valid(): boolean {
    return this.fieldValidations.every((fv) => fv.valid)
  }
}
