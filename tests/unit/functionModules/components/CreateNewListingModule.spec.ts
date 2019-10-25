import { createLocalVue, shallowMount, mount, createWrapper} from '@vue/test-utils'
import { router } from '../../../../src/router'
import store from '../../../../src/store'

import { OpenDrawer, CloseDrawer } from '../../../../src/models/Events'

import CreateNewListingModule from '../../../../src/functionModules/views/CreateNewListingModule'
import CreateNewListing from '../../../../src/views/CreateNewListing.vue'

describe('CreatNewListingModule.ts', () => {


  const localVue = createLocalVue()
  const createNewListingRoute = router.resolve({name: 'createNewListing'}).route
  const createNewListingActionRoute = router.resolve({name: 'createNewListingAction'}).route

  it('emits drawer event', () => {

    const wrapper = shallowMount(CreateNewListing, {
      localVue,
      router,
      store,
    })
    const rootWrapper = createWrapper(wrapper.vm.$root)

    CreateNewListingModule.emitDrawerEvent(wrapper.vm, createNewListingRoute)
    expect(rootWrapper.emitted(CloseDrawer))
    CreateNewListingModule.emitDrawerEvent(wrapper.vm, createNewListingActionRoute)
    expect(rootWrapper.emitted(OpenDrawer))
  })
})
