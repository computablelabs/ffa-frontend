import StringHelper from '../../../src/util/StringHelper'

describe('StringHelper.ts', () => {

  it ('capitalizes', () => {
    expect(StringHelper.capitalize('abc')).toEqual('Abc')
    expect(StringHelper.capitalize('1bc')).toEqual('1bc')
    expect(StringHelper.capitalize('!bc')).toEqual('!bc')
    expect(StringHelper.capitalize('小bc')).toEqual('小bc')
  })
})
