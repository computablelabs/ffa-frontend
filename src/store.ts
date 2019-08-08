import Vue from 'vue'
import Vuex, { Module } from 'vuex'
import flashesModule from './vuexModules/FlashesModule'
import metaMaskModule from './vuexModules/MetaMaskModule'
import uploadModule from './vuexModules/UploadModule'
import listModule from './vuexModules/ListModule'
import voteModule from './vuexModules/VoteModule'
import ffaListingsModule from './vuexModules/FfaListingsModule'
import taggersModule from './vuexModules/TaggersModule'
import web3Module from './vuexModules/Web3Module'

Vue.use(Vuex)

// TODO: does this file need a spec?

export default new Vuex.Store({
  state: {},
  modules: {
    metaMaskModule,
    flashesModule,
    uploadModule,
    listModule,
    voteModule,
    ffaListingsModule,
    taggersModule,
    web3Module,
  },
})
