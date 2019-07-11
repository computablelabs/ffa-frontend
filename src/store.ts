import Vue from 'vue'
import Vuex, { Module } from 'vuex'
import flashesModule from './modules/FlashesModule'

Vue.use(Vuex)

// TODO: does this file need a spec?

export default new Vuex.Store({
  state: {},
  modules: {
    flashesModule,
  },
})
