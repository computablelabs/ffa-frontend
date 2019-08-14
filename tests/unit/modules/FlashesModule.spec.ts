import { shallowMount } from '@vue/test-utils'
// import List from '@/views/List.vue' // TODO: fix vs code lint issue here
import { getModule } from 'vuex-module-decorators'
import flashes from '../../../src/vuexModules/FlashesModule'
import appStore from '../../../src/store'
import Flash from '../../../src/models/Flash'
import { FlashType } from '../../../src/models/Flash'

describe('flashesModule.ts', () => {

  let flash: Flash

  it('correctly gets the module via getModule', () => {
    const flashesModule = getModule(flashes, appStore)
    expect(flashesModule).not.toBeNull()
    expect(flashesModule.flashes).not.toBeNull()
    expect(flashesModule.flashes.length).toBe(0)
    expect(flashesModule.append).not.toBeNull()
    expect(flashesModule.remove).not.toBeNull()
  })

  it('correctly mutates flashes via append', () => {
    const flashesModule = getModule(flashes, appStore)
    const message = 'foo'
    const type = FlashType.error
    flash = new Flash(message, type)
    flashesModule.append(flash)
    expect(flashesModule).not.toBeNull()
    expect(flashesModule.flashes).not.toBeNull()
    expect(flashesModule.flashes.length).toBe(1)
    expect(flashesModule.flashes[0].message).toBe(message)
    expect(flashesModule.flashes[0].type).toBe(type)
  })

  it('correctly mutates flashes via remove', () => {
    const flashesModule = getModule(flashes, appStore)
    const message = 'foo'
    const type = FlashType.error
    expect(flashesModule).not.toBeNull()
    expect(flashesModule.flashes).not.toBeNull()
    expect(flashesModule.flashes.length).toBe(1)
    expect(flashesModule.flashes[0].message).toBe(message)
    expect(flashesModule.flashes[0].type).toBe(type)
    flashesModule.remove(flash.id)
    expect(flashesModule).not.toBeNull()
    expect(flashesModule.flashes).not.toBeNull()
    expect(flashesModule.flashes.length).toBe(0)
  })

  it('correctly rejects duplicate flashes', () => {
    const flashesModule = getModule(flashes, appStore)
    const message = 'foo'
    const type1 = FlashType.error
    const type2 = FlashType.success
    const flash1 = new Flash(message, type1)
    const flash2 = new Flash(message, type2)
    const flash3 = new Flash('bar', type1)
    flashesModule.append(flash1)
    expect(flashesModule.flashes).not.toBeNull()
    expect(flashesModule.flashes.length).toBe(1)
    flashesModule.append(flash1)
    expect(flashesModule.flashes).not.toBeNull()
    expect(flashesModule.flashes.length).toBe(1)
    flashesModule.append(flash2)
    expect(flashesModule.flashes).not.toBeNull()
    expect(flashesModule.flashes.length).toBe(2)
    flashesModule.append(flash3)
    expect(flashesModule.flashes).not.toBeNull()
    expect(flashesModule.flashes.length).toBe(3)
  })
})
