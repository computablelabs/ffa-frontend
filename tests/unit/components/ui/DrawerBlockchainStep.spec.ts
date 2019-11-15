import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import { DrawerBlockchainStepState } from '../../../../src/models/DrawerBlockchainStepState'
import DrawerBlockchainStep from '@/components/ui/DrawerBlockchainStep.vue'

const localVue = createLocalVue()

const defaultLabel = 'default label'
const drawerBlockchainStepClass = 'drawer-blockchain-step'
const drawerMessageClass = 'drawer-message'
const upcomingClass = 'upcoming'
const drawerMessageContainerClass = 'drawer-message-container'
const readyClass = 'ready'
const processButtonClass = 'process-button'
const isLoadingClass = 'is-loading'
const blockchainExecutingMessageClass = 'blockchain-executing-message'
const processingClass = 'processing'
const executingMessageClass = 'executing-message'
const completedClass = 'completed'

describe('DrawerBlockchainStep.vue', () => {

  let wrapper!: Wrapper<DrawerBlockchainStep>

  afterEach(() => {
    wrapper.destroy()
  })

  it ('renders upcoming', () => {
    wrapper = mount(DrawerBlockchainStep, {
      localVue,
      propsData: {
        label: defaultLabel,
        state: DrawerBlockchainStepState.upcoming,
      },
    })

    expect(wrapper.findAll(`.${drawerBlockchainStepClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${drawerMessageContainerClass}.${upcomingClass}`).length).toBe(1)
    const label = wrapper.find(`.${drawerMessageContainerClass}.${upcomingClass} .${drawerMessageClass}`).text()
    expect(label).toEqual(defaultLabel)
  })

  it ('renders ready', () => {
    wrapper = mount(DrawerBlockchainStep, {
      localVue,
      propsData: {
        label: defaultLabel,
        state: DrawerBlockchainStepState.ready,
      },
    })

    expect(wrapper.findAll(`.${drawerBlockchainStepClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${processButtonClass}.${readyClass}`).length).toBe(1)
    const label = wrapper.find(`.${processButtonClass}.${readyClass} a`).text()
    expect(label).toEqual(defaultLabel)
  })

  it ('calls the callback', () => {
    const spy = jest.fn(() => { return })
    wrapper = mount(DrawerBlockchainStep, {
      localVue,
      propsData: {
        label: defaultLabel,
        state: DrawerBlockchainStepState.ready,
        onButtonClick: spy,
      },
    })

    wrapper.find(`.${processButtonClass}.${readyClass} a`).trigger('click')
    expect(spy).toBeCalled()
  })

  it ('renders processing', () => {
    wrapper = mount(DrawerBlockchainStep, {
      localVue,
      propsData: {
        label: defaultLabel,
        state: DrawerBlockchainStepState.processing,
      },
    })

    expect(wrapper.findAll(`.${drawerBlockchainStepClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${blockchainExecutingMessageClass}.${processingClass}`).length).toBe(1)
    const label = wrapper.find(`.${blockchainExecutingMessageClass} .${executingMessageClass}`).text()
    expect(label).toEqual(defaultLabel)
  })

  it ('renders completed', () => {
    wrapper = mount(DrawerBlockchainStep, {
      localVue,
      propsData: {
        label: defaultLabel,
        state: DrawerBlockchainStepState.completed,
      },
    })

    expect(wrapper.findAll(`.${drawerBlockchainStepClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${drawerMessageContainerClass}.${completedClass}`).length).toBe(1)
    const label = wrapper.find(`.${drawerMessageContainerClass} .${drawerMessageClass}`).text()
    expect(label).toEqual(defaultLabel)
  })

})
