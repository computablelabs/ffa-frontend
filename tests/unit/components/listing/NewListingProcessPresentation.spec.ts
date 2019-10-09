import { mount, createLocalVue, Wrapper } from '@vue/test-utils'

import NewListingProcessPresentation from '../../../../src/components/listing/NewListingProcessPresentation.vue'
import appStore from '../../../../src/store'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'

const localVue = createLocalVue()
const rootId = 'new-listing-process-presentation'
const dataListButtonMessageAttribute = 'data-test-list-button-message'
const listButtonClass = 'list-button'
const clickableElementClass = 'button'
const drawerMessageClass = 'drawer-message-container'
const listingDoneText = 'Sent to the cooperative'
const uploadDoneText = 'Uploaded'
const votingText = 'Voting is open for this listing'

let wrapper!: Wrapper<NewListingProcessPresentation>

describe('NewListingProcessPresentation.vue', () => {

  it('it renders the button waiting for the user to start things', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStepStatus: ProcessStatus.Ready,
        listingStepButtonText: 'start',
        uploadStepStatus: ProcessStatus.Ready,
        uploadStepLabel: 'uplading',
        uploadPercentComplete: 23,
        transactionHashIsAssigned: false,
      },
    })

    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(1)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(1)

    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(0)
    expect(root.findAll(`.${drawerMessageClass}`).length).toBe(0)
    expect(root.findAll({ name: 'Status' }).length).toBe(0)

    expect(root.emitted('onStartButtonClick')).toBeFalsy()
    // respond to click
    root.find(`.${listButtonClass} .${clickableElementClass}`).trigger('click')
    expect(root.emitted('onStartButtonClick')).toBeTruthy()
  })

  it('it renders a busy button ', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStepStatus: ProcessStatus.Executing,
        listingStepButtonText: 'start',
        uploadStepStatus: ProcessStatus.Ready,
        uploadStepLabel: 'uplading',
        uploadPercentComplete: 23,
        transactionHashIsAssigned: false,
      },
    })

    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(1)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(1)

    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(0)
    expect(root.findAll(`.${drawerMessageClass}`).length).toBe(0)
    expect(root.findAll({ name: 'Status' }).length).toBe(0)

    expect(root.emitted('startButtonClicked')).toBeFalsy()
    // respond to click
    root.find(`.${listButtonClass} .${clickableElementClass}`).trigger('click')
    expect(root.emitted('startButtonClicked')).toBeFalsy()
  })

  it('it renders in-progress status components', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStepStatus: ProcessStatus.Executing,
        listingStepButtonText: 'start',
        uploadStepStatus: ProcessStatus.Executing,
        uploadStepLabel: 'uplading',
        uploadPercentComplete: 23,
        transactionHashIsAssigned: true,
      },
    })

    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(0)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(0)

    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(1)
    expect(root.findAll(`.${drawerMessageClass}`).length).toBe(0)
    expect(root.findAll({ name: 'Status' }).length).toBe(1)
    expect(root.find({ name: 'Status' }).props('percentComplete')).toBe(23)
  })

  it('it renders listing done, upload in progress', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStepStatus: ProcessStatus.Complete,
        listingStepButtonText: 'start',
        uploadStepStatus: ProcessStatus.Executing,
        uploadStepLabel: 'uplading',
        uploadPercentComplete: 23,
        transactionHashIsAssigned: true,
      },
    })

    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(0)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(0)
    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(0)

    expect(root.findAll(`.${drawerMessageClass}`).length).toBe(1)
    expect(root.find(`.${drawerMessageClass} div`).text()).toBe(listingDoneText)
    expect(root.findAll({ name: 'Status' }).length).toBe(1)
  })

  it('it renders upload done, listing in progress', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStepStatus: ProcessStatus.Executing,
        listingStepButtonText: 'start',
        uploadStepStatus: ProcessStatus.Complete,
        uploadStepLabel: 'uplading',
        uploadPercentComplete: 23,
        transactionHashIsAssigned: true,
      },
    })

    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(0)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(0)
    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(1)

    expect(root.findAll(`.${drawerMessageClass}`).length).toBe(1)
    expect(root.find(`.${drawerMessageClass} div`).text()).toBe(uploadDoneText)
    expect(root.findAll({ name: 'Status' }).length).toBe(0)
  })

  it('it renders voting is happening when both are done', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStepStatus: ProcessStatus.Complete,
        listingStepButtonText: 'start',
        uploadStepStatus: ProcessStatus.Complete,
        uploadStepLabel: 'uplading',
        uploadPercentComplete: 23,
        transactionHashIsAssigned: true,
      },
    })

    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(0)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(0)
    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(0)

    expect(root.findAll(`.${drawerMessageClass}`).length).toBe(1)
    expect(root.find(`.${drawerMessageClass} div`).text()).toBe(votingText)
    expect(root.findAll({ name: 'Status' }).length).toBe(0)
  })





})
