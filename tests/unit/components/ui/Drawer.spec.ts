import { shallowMount, createLocalVue, createWrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import DrawerModule, { DrawerState } from '../../../../src/vuexModules/DrawerModule'

import {
  DrawerClosed,
  OpenDrawer,
  CloseDrawer } from '../../../../src/models/Events'

import Drawer from '@/components/ui/Drawer.vue'
import FileUploader from '@/components/listing/FileUploader.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)
const drawerClass = 'drawer'
const closeButtonClass = 'delete'
const drawerOpenClass = 'open'
const openDrawerEvent = 'open-drawer'

describe('Drawer.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
  })

  it('renders the Drawer component', () => {
    const wrapper = shallowMount(Drawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    const drawerModule = getModule(DrawerModule, appStore)

    expect(wrapper.findAll(`section.${drawerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${closeButtonClass}`).length).toBe(0)

    drawerModule.setDrawerCanClose(true)
    expect(wrapper.findAll(`.${closeButtonClass}`).length).toBe(1)

    drawerModule.setDrawerCanClose(false)
    expect(wrapper.findAll(`.${closeButtonClass}`).length).toBe(0)
  })

  it('closes drawer when button is clicked', () => {
    const wrapper = shallowMount(Drawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    const drawerModule = getModule(DrawerModule, appStore)
    wrapper.find(`.${drawerClass}`).trigger(openDrawerEvent)
    drawerModule.setDrawerCanClose(true)
    expect(wrapper.findAll(`.${drawerOpenClass}`).length).toBe(1)

    wrapper.find(`.${closeButtonClass}`).trigger('click')
    expect(wrapper.findAll(`.${drawerOpenClass}`).length).toBe(0)
    const rootWrapper = createWrapper(wrapper.vm.$root)
    expect(rootWrapper.emitted(DrawerClosed)).toBeDefined()
  })

  it('responds to events', () => {
    const wrapper = shallowMount(Drawer, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    wrapper.trigger(CloseDrawer)
    expect(wrapper.findAll(`.${drawerOpenClass}`).length).toBe(0)

    wrapper.trigger(OpenDrawer)
    expect(wrapper.findAll(`.${drawerOpenClass}`).length).toBe(1)
  })
})
