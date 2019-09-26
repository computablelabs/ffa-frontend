import { Eventable } from '../../../../src/interfaces/Eventable'

import EventableModule from '../../../../src/functionModules/eventable/EventableModule'

describe('EventableModule.ts', () => {

  const log: Eventable = {
    timestamp: new Date().getTime(),
    log: 'log',
  }

  const success: Eventable = {
    timestamp: new Date().getTime(),
    processId: '123',
    response: {
      value: 'some value',
    },
  }
  const error: Eventable = {
    timestamp: new Date().getTime(),
    error: new Error('error'),
  }

  const notEventable = {
    foo: 'foo',
  }

  it ('identifies eventables', () => {
    expect(EventableModule.isEventable(log)).toBeTruthy()
    expect(EventableModule.isEventable(success)).toBeTruthy()
    expect(EventableModule.isEventable(error)).toBeTruthy()
  })


  it ('identifies not eventables', () => {
    expect(EventableModule.isEventable(notEventable)).toBeFalsy()
  })

})
