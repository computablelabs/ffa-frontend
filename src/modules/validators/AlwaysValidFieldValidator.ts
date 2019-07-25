import FfaFieldValidator from './FfaFieldValidator'
import FfaFieldValidation from './FfaFieldValidation'

/**
 * A field validator that always returns valid = true
 */
export default class AlwaysValidFieldValidator extends FfaFieldValidator {

  public validate(): FfaFieldValidation {
    const validation = new FfaFieldValidation(this.field)
    validation.valid = true
    return validation
  }
}
