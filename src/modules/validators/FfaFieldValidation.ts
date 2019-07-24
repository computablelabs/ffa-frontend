import { FieldValidation } from 'global'

export default class FfaFieldValidation implements FieldValidation {
  public field!: string
  public valid: boolean = false
  public errorMessage!: string

  constructor(field: string) {
    this.field = field
  }
}
