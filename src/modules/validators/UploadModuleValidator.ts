import FfaFieldValidation from './FfaFieldValidation'
import FfaModuleValidator from './FfaModuleValidator'
import TitleFieldValidator from './TitleFieldValidator'
import FfaFieldValidator from './FfaFieldValidator'
import AlwaysValidFieldValidator from './AlwaysValidFieldValidator'

export default class UploadModuleValidator extends FfaModuleValidator {

  public validateField(field: string): FfaFieldValidation {
    const fieldValidation = new FfaFieldValidation(field)
    const value = this.state[field]
    let validator: FfaFieldValidator
    switch (field) {
      case 'title':
        validator = new TitleFieldValidator(field, value, this.vuexStore)
        return validator.validate()
      default:
        validator = new AlwaysValidFieldValidator(field, value, this.vuexStore)
    }
    return validator.validate()
  }
}
