import Validatable from '../../interfaces/validation/Validatable'
import FfaValidation from './FfaValidation'
import FfaFieldValidation from './FfaFieldValidation'
import UploadModule from 'modules/UploadModule'

export default class UploadValidator implements Validatable {

  public target!: UploadModule

  private fields: string[] = [
    'filename',
    'title',
    'description',
    'hash',
    'md5',
    'tags',
  ]

  constructor(target: UploadModule) {
    this.target = target
  }

  public validate(): FfaValidation {
    const validation = new FfaValidation('uploadModule')
    validation.fieldValidations = this.fields.map((field) => this.validateField(field))
    return validation
  }

  public validateField(field: string): FfaFieldValidation {
    const fieldValidation = new FfaFieldValidation(field)
    switch (field) {
      case 'title':
        fieldValidation.valid = false
        fieldValidation.errorMessage = 'message'
      default:
        fieldValidation.valid = true
    }
    return fieldValidation
  }
}
