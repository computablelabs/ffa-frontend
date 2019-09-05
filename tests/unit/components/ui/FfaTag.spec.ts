import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'
import VueRouter from 'vue-router'
import FfaTag from '../../../../src/components/ui/FfaTag.vue'
import appStore from '../../../../src/store'
import { getModule } from 'vuex-module-decorators'
import TaggersModule from '../../../../src/vuexModules/TaggersModule'

const localVue = createLocalVue()
const ffaTagClass = 'ffa-tag'
const deleteClass = 'delete'
const editableClass = 'editable'

let wrapper!: Wrapper<FfaTag>

afterEach(() => {
  wrapper.destroy()
})

describe('FfaTag.vue', () => {

  const key = 'key'

  beforeAll(() => {
    localVue.use(VueRouter)
  })

  it('renders the FfaTag component', () => {

    wrapper = shallowMount(FfaTag, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        taggerKey: key,
        tag: 'foo',
      },
    })

    expect(wrapper.findAll(`.${ffaTagClass}`).length).toBe(1)
    expect(wrapper.find(`.${ffaTagClass}`).text()).toEqual('foo')
    expect(wrapper.findAll(`.${ffaTagClass} button`).length).toBe(1)
  })


  it ('renders editable tag by default', () => {
    wrapper = shallowMount(FfaTag, {
      propsData: {
        tag: 'foo',
      },
    })

    expect(wrapper.findAll(`.${ffaTagClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${ffaTagClass}.${editableClass}`).length).toBe(1)
    expect(wrapper.find(`.${ffaTagClass}`).text()).toEqual('foo')
    expect(wrapper.findAll(`.${ffaTagClass} button`).length).toBe(1)
  })

  it ('renders editable tags when specifically configured true', () => {
    wrapper = shallowMount(FfaTag, {
      propsData: {
        tag: 'foo',
        editable: true,
      },
    })

    expect(wrapper.findAll(`.${ffaTagClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${ffaTagClass}.${editableClass}`).length).toBe(1)
    expect(wrapper.find(`.${ffaTagClass}`).text()).toEqual('foo')
    expect(wrapper.findAll(`.${ffaTagClass} button`).length).toBe(1)
  })

  it ('renders non-editable tags', () => {
    wrapper = shallowMount(FfaTag, {
      propsData: {
        tag: 'foo',
        editable: false,
      },
    })

    expect(wrapper.findAll(`.${ffaTagClass}`).length).toBe(1)
    expect(wrapper.findAll(`.${ffaTagClass}.${editableClass}`).length).toBe(0)
    expect(wrapper.find(`.${ffaTagClass}`).text()).toEqual('foo')
    expect(wrapper.findAll(`.${ffaTagClass} button`).length).toBe(0)
  })

  // TODO: this test is probably better accomplished via a spy
  it('deletes the tag after clicking the delete button', () => {

    const taggersModule = getModule(TaggersModule, appStore)
    taggersModule.addTag(`${key}:foo`)

    wrapper = shallowMount(FfaTag, {
      attachToDocument: true,
      store: appStore,
      localVue,
      propsData: {
        taggerKey: key,
        tag: 'foo',
      },
    })

    wrapper.find(`.${ffaTagClass} .${deleteClass}`).trigger('click')
    expect(taggersModule.taggers[key].length).toBe(0)
  })
})
