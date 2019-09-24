import FfaFieldValidator from './FfaFieldValidator'
import FfaFieldValidation from './FfaFieldValidation'
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../FfaListingsModule'

/**
 * Validate a title against known uploaded titles from the FfaListingsModule.
 *
 * (titles are expected to be unique in `FfaListingsModule.uploadedTitles`)
 */
export default class TitleFieldValidator extends FfaFieldValidator {

  public validate(): FfaFieldValidation {
    const listingsModule = getModule(FfaListingsModule, this.vuexStore)
    const validation = new FfaFieldValidation(this.field)
    console.log(`!!!> ${listingsModule.allTitles}`)
    validation.valid = listingsModule.allTitles.indexOf(this.value) < 0
    if (!validation.valid) {
      validation.errorMessage = `Title '${this.value}' already in use!`
    }
    return validation
  }
}
