import { shallowMount, createLocalVue, mount, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'
import AppModule from '../../../../src/vuexModules/AppModule'

import VotingProcess from '../../../../src/components/voting/VotingProcess.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const localVue = createLocalVue()
localVue.use(VueRouter)
library.add(faFileSolid, faFile, faCheckCircle)
const drawerId = 'voting-drawer'
const statusClass = 'status'

describe('Drawer.vue', () => {

  const appModule = getModule(AppModule, appStore)
  let wrapper!: Wrapper<VotingProcess>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders nothing if user cannot vote', () => {

    appModule.setStake(1)
    appModule.setMarketTokenBalance(0)

    wrapper = shallowMount(VotingProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })
    expect(wrapper.findAll(`section.${drawerId}`).length).toBe(0)
  })

  it('renders drawer if user can vote', () => {

    appModule.setStake(1)
    appModule.setMarketTokenBalance(100)

    wrapper = shallowMount(VotingProcess, {
      attachToDocument: true,
      store: appStore,
      localVue,
    })

    expect(wrapper.findAll(`#${drawerId}`).length).toBe(1)
    expect(wrapper.findAll(`.${statusClass}`).length).toBe(1)
  })
})
