import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import FfaTagger from '../../../../src/components/ui/FfaTagger.vue'
import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFile as faFileSolid } from '@fortawesome/free-solid-svg-icons'
import { faFile, faCheckCircle, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import TaggersModule from '../../../../src/vuexModules/TaggersModule'

const localVue = createLocalVue()
library.add(faFileSolid, faFile, faCheckCircle, faPlusSquare)
const ffaTaggerClass = 'ffa-tagger'
const isParentClass = 'is-parent'
const controlClass = 'control'
const labelClass = 'label'
const tagInputClass = 'tag-input'
const helpClass = 'help'
const isDangerClass = 'is-danger'
const addContainerClass = 'add-container'
const addButtonClass = 'add-button'
const tagContainerClass = 'tag-container'
const ffaTagClass = 'ffa-tag'

describe('FfaTagger.vue', () => {

  const key = 'key'

  beforeAll(() => {
    localVue.use(VueRouter)
    localVue.component('font-awesome-icon', FontAwesomeIcon)
  })

  it('renders the default FfaTagger component', () => {

    const wrapper = shallowMount(FfaTagger, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        taggerKey: key,
      },
    })

    expect(wrapper.findAll(`.${ffaTaggerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${ffaTaggerClass} .${isParentClass}`).length).toBe(2)
    expect(wrapper.findAll(`.${ffaTaggerClass} .${controlClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${ffaTaggerClass} .${controlClass} label`).length).toBe(0)
    expect(wrapper.findAll(`.${ffaTaggerClass} .${controlClass} input`).length).toBe(1)
    expect(wrapper.findAll(`.${ffaTaggerClass} .${controlClass} .${labelClass}`).length).toBe(0)
    expect(wrapper.findAll(`.${ffaTaggerClass} .${controlClass} .${tagInputClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${ffaTaggerClass} .${addContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${ffaTaggerClass} .${addContainerClass} .${addButtonClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${ffaTaggerClass} .${tagContainerClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${ffaTaggerClass} .${tagContainerClass} div`).length).toBe(0)
    const tagContainer = wrapper.find(`.${ffaTaggerClass} .${tagContainerClass}`).element as HTMLDivElement
    expect(tagContainer.childElementCount).toBe(0)
  })

  it('renders tags from the module', () => {

    const taggersModule = getModule(TaggersModule, appStore)
    taggersModule.addTag(`${key}:foo`)
    taggersModule.addTag(`${key}:bar`)
    taggersModule.addTag(`${key}:baz`)

    const wrapper = mount(FfaTagger, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        taggerKey: key,
      },
    })

    expect(wrapper.findAll(`.${ffaTaggerClass} .${tagContainerClass} .${ffaTagClass}`).length).toBe(3)
    const tagContainer = wrapper.find(`.${ffaTaggerClass} .${tagContainerClass}`).element as HTMLDivElement
    expect(tagContainer.childElementCount).toBe(3)
  })

  it('adds tags when user hits enter key', () => {
    const wrapper = mount(FfaTagger, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        taggerKey: key,
      },
    })

    const input = wrapper.find(`.${ffaTaggerClass} .${controlClass} .${tagInputClass}`)
    input.setValue('foo bar,baz,,1 , #2,,3   ,,,,, ,  , 4! ,, ,')
    input.trigger('keyup.enter')

    expect(wrapper.findAll(`.${ffaTaggerClass} .${tagContainerClass} .${ffaTagClass}`).length).toBe(7)
    const tagContainer = wrapper.find(`.${ffaTaggerClass} .${tagContainerClass}`).element as HTMLDivElement
    expect(tagContainer.childElementCount).toBe(7)

    // But we expect changes in the vuex model
    const taggersModule = getModule(TaggersModule, appStore)
    expect(taggersModule.taggers[key].length).toBe(7)
    expect(taggersModule.taggers[key].indexOf('foo')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('bar')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('baz')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('1')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('#2')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('3')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('4!')).toBeGreaterThanOrEqual(0)
  })

  it('adds tags when user hits clicks the add tag button', () => {
    const wrapper = mount(FfaTagger, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        taggerKey: key,
      },
    })

    const input = wrapper.find(`.${ffaTaggerClass} .${controlClass} .${tagInputClass}`)
    input.setValue('foo bar,baz,,1 , #2,,3   ,,,,, ,  , 4! ,, ,')

    const button = wrapper.find(`.${ffaTaggerClass} .${addContainerClass} .${addButtonClass}`)
    button.trigger('click')

    expect(wrapper.findAll(`.${ffaTaggerClass} .${tagContainerClass} .${ffaTagClass}`).length).toBe(7)
    const tagContainer = wrapper.find(`.${ffaTaggerClass} .${tagContainerClass}`).element as HTMLDivElement
    expect(tagContainer.childElementCount).toBe(7)

    const taggersModule = getModule(TaggersModule, appStore)
    expect(taggersModule.taggers[key].length).toBe(7)
    expect(taggersModule.taggers[key].indexOf('foo')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('bar')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('baz')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('1')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('#2')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('3')).toBeGreaterThanOrEqual(0)
    expect(taggersModule.taggers[key].indexOf('4!')).toBeGreaterThanOrEqual(0)
  })

})
