import FieldValidation from 'interfaces/validation/FieldValidation'

/**
 * Represents the _result_ of validating an Ffa field
 */
export default class FfaFieldValidation implements FieldValidation {
  public field!: string
  public valid: boolean = false
  public errorMessage!: string

  constructor(field: string) {
    this.field = field
  }
}
