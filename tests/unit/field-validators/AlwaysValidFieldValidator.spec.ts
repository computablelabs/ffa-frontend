import AlwaysValidFieldValidator from '../../../src/modules/validators/AlwaysValidFieldValidator'
import appStore from '../../../src/store'

describe('AlwaysValidFieldValidator.ts', () => {

  it('correctly returns true', () => {
    let validator = new AlwaysValidFieldValidator('field', true, appStore)
    expect(validator.validate().valid).toBeTruthy()
    validator = new AlwaysValidFieldValidator('field', false, appStore)
    expect(validator.validate().valid).toBeTruthy()
    validator = new AlwaysValidFieldValidator('field', null, appStore)
    expect(validator.validate().valid).toBeTruthy()
    validator = new AlwaysValidFieldValidator('field', 'whatever', appStore)
    expect(validator.validate().valid).toBeTruthy()
    validator = new AlwaysValidFieldValidator('field', {}, appStore)
    expect(validator.validate().valid).toBeTruthy()
    validator = new AlwaysValidFieldValidator('field', [], appStore)
    expect(validator.validate().valid).toBeTruthy()
  })
})
