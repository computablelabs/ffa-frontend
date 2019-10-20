import Vue from 'vue'
import Vuex, { Module } from 'vuex'
import appModule from './vuexModules/AppModule'
import flashesModule from './vuexModules/FlashesModule'
import drawerModule from './vuexModules/DrawerModule'
import uploadModule from './vuexModules/UploadModule'
import newListingModule from './vuexModules/NewListingModule'
import votingModule from './vuexModules/VotingModule'
import ffaListingsModule from './vuexModules/FfaListingsModule'
import taggersModule from './vuexModules/TaggersModule'
import purchaseModule from './vuexModules/PurchaseModule'
import datatrustTaskModule from './vuexModules/DatatrustTaskModule'
import eventModule from './vuexModules/EventModule'
import supportWithdrawModule from './vuexModules/SupportWithdrawModule'
import challengeModule from './vuexModules/ChallengeModule'

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
    votingModule,
    ffaListingsModule,
    taggersModule,
    purchaseModule,
    datatrustTaskModule,
    eventModule,
    supportWithdrawModule,
    challengeModule,
  },
})

console.log('Vuex store initialized')
