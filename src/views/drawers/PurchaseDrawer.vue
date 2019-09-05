<template>
  <div class="list-drawer-container">
    <PurchaseProcess v-if="hasMetamask"/>
    <div class="drawer-error" v-else>
      Metamask not connected or not installed.
    </div>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

import PurchaseProcess from '@/components/purchase/PurchaseProcess.vue'
import BaseDrawer from './BaseDrawer.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'

import '@/assets/style/components/list-drawer.sass'

const appVuexModule = 'appModule'

@Component({
  components: {
    PurchaseProcess,
  },
})
export default class PurchaseDrawer extends BaseDrawer {

  @NoCache
  public get hasMetamask(): boolean {
    const appModule = getModule(AppModule, this.$store)
    return appModule.appReady
  }

  public mounted(this: PurchaseDrawer) {
    console.log('PurchaseDrawer mounted')
  }
}
</script>