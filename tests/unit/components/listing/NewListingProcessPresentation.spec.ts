import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { router } from '../../../../src/router'

import appStore from '../../../../src/store'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'

import NewListingProcessPresentation from '../../../../src/components/listing/NewListingProcessPresentation.vue'

const localVue = createLocalVue()
const rootId = 'new-listing-process-presentation'
const dataListButtonMessageAttribute = 'data-test-list-button-message'
const listButtonClass = 'list-button'
const clickableElementClass = 'button'
const drawerMessageClass = 'drawer-message-container'
const dataTrustInProgressText = 'Verifying upload'
const listingDoneText = 'Sent to the cooperative'
const uploadDoneText = 'Uploaded'
const votingText = 'Voting is open for this listing'
const executingMessageClass = 'executing-message'
const onUpdateDrawerCanCloseEvent = 'onUpdateDrawerCanClose'

let wrapper!: Wrapper<NewListingProcessPresentation>

describe('NewListingProcessPresentation.vue', () => {

  beforeAll(() => {
    localVue.use(VueRouter)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('it renders the button waiting for the user to start things', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStatus: ProcessStatus.Ready,
        listingStepButtonText: 'start',
        uploadStatus: ProcessStatus.Ready,
        uploadStepLabel: 'uploading',
        uploadPercentComplete: 23,
        hasTransactionHash: false,
        datatrustStatus: ProcessStatus.NotReady,
      },
    })

    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(1)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(1)

    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(0)
    expect(root.findAll(`.${drawerMessageClass}`).length).toBe(0)
    expect(root.findAll({ name: 'Status' }).length).toBe(0)

    expect(wrapper.emitted().onUpdateDrawerCanClose).toEqual([[true]])
  })

  it('it renders a busy button ', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStatus: ProcessStatus.Executing,
        listingStepButtonText: 'start',
        uploadStatus: ProcessStatus.Ready,
        uploadStepLabel: 'uploading',
        uploadPercentComplete: 23,
        hasTransactionHash: false,
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
    expect(wrapper.emitted().onUpdateDrawerCanClose).toEqual([[false]])
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
        listingStatus: ProcessStatus.Executing,
        listingStepButtonText: 'start',
        uploadStatus: ProcessStatus.Executing,
        uploadStepLabel: 'uploading',
        uploadPercentComplete: 23,
        hasTransactionHash: true,
      },
    })

    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(0)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(0)

    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(1)
    expect(root.findAll(`.${drawerMessageClass}`).length).toBe(1)
    expect(root.findAll({ name: 'Status' }).length).toBe(1)
    expect(root.find({ name: 'Status' }).props('percentComplete')).toBe(23)
    expect(wrapper.emitted().onUpdateDrawerCanClose).toEqual([[false]])
  })

  it('it renders listing done, upload in progress', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStatus: ProcessStatus.Complete,
        listingStepButtonText: 'start',
        uploadStatus: ProcessStatus.Executing,
        uploadStepLabel: 'uploading',
        uploadPercentComplete: 23,
        hasTransactionHash: true,
      },
    })

    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(0)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(0)
    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(0)

    expect(root.findAll(`.${drawerMessageClass}`).length).toBe(2)
    expect(root.find(`.${drawerMessageClass} div`).text()).toBe(listingDoneText)
    expect(root.findAll({ name: 'Status' }).length).toBe(1)
    expect(wrapper.emitted().onUpdateDrawerCanClose).toEqual([[false]])
  })

  it('it renders listing done, upload done, datatrust in progress', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStatus: ProcessStatus.Complete,
        listingStepButtonText: 'start',
        uploadStatus: ProcessStatus.Complete,
        uploadStepLabel: 'uploading',
        uploadPercentComplete: 23,
        hasTransactionHash: true,
        datatrustStatus: ProcessStatus.Executing,
      },
    })
    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(0)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(0)
    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(1)

    const drawers = root.findAll(`.${drawerMessageClass}`)
    expect(drawers.length).toBe(2)
    expect(drawers.at(0).find('div').text()).toBe(listingDoneText)
    expect(drawers.at(1).find('div').text()).toBe(uploadDoneText)

    expect(root.findAll(`.${executingMessageClass}`).length).toBe(1)
    expect(root.find(`.${executingMessageClass}`).text()).toBe(dataTrustInProgressText)
  })

  it('it renders upload done, listing in progress', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        listingStatus: ProcessStatus.Executing,
        listingStepButtonText: 'start',
        uploadStatus: ProcessStatus.Complete,
        uploadStepLabel: 'uploading',
        uploadPercentComplete: 23,
        hasTransactionHash: true,
        datatrustStatus: ProcessStatus.Ready,
      },
    })

    expect(wrapper.findAll(`#${rootId}`).length).toBe(1)
    const root = wrapper.find(`#${rootId}`)

    expect(root.findAll('[data-test-list-button-message=true]').length).toBe(0)
    expect(root.findAll(`.${listButtonClass}`).length).toBe(0)
    expect(root.findAll({ name: 'BlockchainExecutingMessage' }).length).toBe(2)

    expect(root.findAll(`.${drawerMessageClass}`).length).toBe(1)
    expect(root.find(`.${drawerMessageClass} div`).text()).toBe(uploadDoneText)
    expect(root.findAll({ name: 'Status' }).length).toBe(0)
    expect(wrapper.emitted().onUpdateDrawerCanClose).toEqual([[false]])
  })

  it('it renders voting is happening when done', () => {
    wrapper = mount(NewListingProcessPresentation, {
      attachToDocument: true,
      store: appStore,
      localVue,
      router,
      propsData: {
        listingStatus: ProcessStatus.Complete,
        listingStepButtonText: 'start',
        uploadStatus: ProcessStatus.Complete,
        uploadStepLabel: 'uploading',
        uploadPercentComplete: 23,
        hasTransactionHash: true,
        datatrustStatus: ProcessStatus.Complete,
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
    expect(wrapper.emitted().onUpdateDrawerCanClose).toEqual([[true]])
  })
})
