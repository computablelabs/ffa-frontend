import Vue from 'vue'
import Vuex, { Module } from 'vuex'
import flashesModule from './modules/FlashesModule'
import uploadModule from './modules/UploadModule'
import listModule from './modules/ListModule'
import voteModule from './modules/VoteModule'

Vue.use(Vuex)

// TODO: does this file need a spec?

export default new Vuex.Store({
  state: {},
  modules: {
    flashesModule,
    uploadModule,
    listModule,
    voteModule,
  },
})
