import Vuex from 'vuex'
import { shallowMount, mount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Status from '@/components/ui/Status.vue'
import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FileUploader from '@/components/listing/FileUploader.vue'
import UploadModule from '../../../../src/vuexModules/UploadModule'
import { ProcessStatus, ProcessStatusLabelMap } from '../../../../src/models/ProcessStatus'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle)
const statusClass = 'status'
const indicatorClass = 'indicator'
const c100Class = 'c100'
const labelClass = 'label'
const buttonClass = 'button'

describe('Status.vue', () => {

  const uploadLabels: ProcessStatusLabelMap = {}
  uploadLabels[ProcessStatus.NotReady] = 'Upload'
  uploadLabels[ProcessStatus.Ready] = 'Upload'
  uploadLabels[ProcessStatus.Executing] = 'Uploading'
  uploadLabels[ProcessStatus.Complete] = 'Upload complete.'
  uploadLabels[ProcessStatus.Error] = 'Upload failure'

  let wrapper!: Wrapper<Status>

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('FileUploader', FileUploader)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders the default Status component', () => {

    const uploadModule = getModule(UploadModule, appStore)

    wrapper = shallowMount(Status, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        vuexModule: uploadModule,
        statusLabels: uploadLabels,
      },
    })
    expect(wrapper.findAll(`.${statusClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${statusClass} .${indicatorClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${statusClass} .${indicatorClass} .${c100Class}`).length).toBe(1)
    expect(wrapper.findAll(`.${statusClass} .${labelClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${statusClass} .${labelClass} .${buttonClass}`).length).toBe(0)
    expect(wrapper.find(`.${statusClass} .${labelClass} span`).text()).toEqual('Upload')
  })

  it('renders the execute button when state is .Ready', () => {
    const uploadModule = getModule(UploadModule, appStore)

    wrapper = mount(Status, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        vuexModule: uploadModule,
        statusLabels: uploadLabels,
      },
    })

    uploadModule.setStatus(ProcessStatus.Ready)

    expect(wrapper.findAll(`.${statusClass} .${labelClass} .${buttonClass}`).length).toBe(1)
    expect(wrapper.find(`.${statusClass} .${labelClass} .${buttonClass}`).text())
      .toEqual(uploadLabels[ProcessStatus.Ready])
  })

  it('renders the percentage when updated', () => {
    const uploadModule = getModule(UploadModule, appStore)

    wrapper = mount(Status, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        vuexModule: uploadModule,
        statusLabels: uploadLabels,
      },
    })

    uploadModule.setStatus(ProcessStatus.Executing)
    uploadModule.setPercentComplete(33.333)
    expect(wrapper.findAll(`.${statusClass} .${indicatorClass} .${c100Class}.p33`).length).toBe(1)
    expect(wrapper.find(`.${statusClass} .${indicatorClass} .${c100Class} span`).text()).toEqual('33%')
    expect(wrapper.find(`.${statusClass} .${labelClass} span`).text())
      .toEqual(uploadLabels[ProcessStatus.Executing])
  })

  it('renders the correct message when complete', () => {
    const uploadModule = getModule(UploadModule, appStore)

    wrapper = mount(Status, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        vuexModule: uploadModule,
        statusLabels: uploadLabels,
      },
    })
    // FYI: if you don't set percentComplete here
    // and rely on the 33.333 value above set in state
    // the code that trims the precision doesn't run
    uploadModule.setPercentComplete(100)
    uploadModule.setStatus(ProcessStatus.Complete)

    expect(wrapper.findAll(`.${statusClass} .${indicatorClass} .${c100Class}.p100`).length).toBe(1)
    expect(wrapper.find(`.${statusClass} .${indicatorClass} .${c100Class} span`).text()).toEqual('100%')
    expect(wrapper.find(`.${statusClass} .${labelClass} span`).text())
      .toEqual(uploadLabels[ProcessStatus.Complete])
  })

})
