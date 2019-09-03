import Vue from 'vue'
import Vuex, { Module } from 'vuex'
import appModule from './vuexModules/AppModule'
import flashesModule from './vuexModules/FlashesModule'
import drawerModule from './vuexModules/DrawerModule'
import uploadModule from './vuexModules/UploadModule'
import newListingModule from './vuexModules/NewListingModule'
import voteModule from './vuexModules/VoteModule'
import ffaListingsModule from './vuexModules/FfaListingsModule'
import taggersModule from './vuexModules/TaggersModule'
import web3Module from './vuexModules/Web3Module'

Vue.use(Vuex)

// TODO: does this file need a spec?

export default new Vuex.Store({
  state: {},
  modules: {
    appModule,
    flashesModule,
    drawerModule,
    uploadModule,
    newListingModule,
    voteModule,
    ffaListingsModule,
    taggersModule,
    web3Module,
  },
})

console.log('Vuex store initialized')
