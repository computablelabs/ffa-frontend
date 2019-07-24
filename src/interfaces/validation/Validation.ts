import FieldValidation from './FieldValidation'

export default interface Validation {
  module: string,
  valid: boolean,
  fieldValidations: FieldValidation[]
}
