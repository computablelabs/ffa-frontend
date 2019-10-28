import appStore from '../../../src/store'
import { getModule } from 'vuex-module-decorators'
import DrawerModule, { DrawerState, DrawerMode } from '../../../src/vuexModules/DrawerModule'

describe('DrawerModule.ts', () => {

  it('correctly gets the module via getModule', () => {
    const drawerModule = getModule(DrawerModule, appStore)
    expect(drawerModule).not.toBeNull()
    expect(drawerModule.status).toBe(DrawerState.beforeProcessing)
    expect(drawerModule.mode).toBe(DrawerMode.listing)
    expect(drawerModule.canClose).toBeFalsy()
    expect(drawerModule.drawerOpenClass).toEqual('')
  })

  it('correctly mutates', () => {
    const drawerModule = getModule(DrawerModule, appStore)
    drawerModule.setDrawerState(DrawerState.processing)
    expect(drawerModule.status).toBe(DrawerState.processing)
    drawerModule.setDrawerMode(DrawerMode.buying)
    expect(drawerModule.mode).toBe(DrawerMode.buying)
    drawerModule.setDrawerCanClose(true)
    expect(drawerModule.canClose).toBeTruthy()
    drawerModule.setDrawerOpenClass('foo')
    expect(drawerModule.drawerOpenClass).toEqual('foo')
  })
})
