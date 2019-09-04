<template>
  <div>
    <div id="purchase-drawer"
      class="tile is-vertical is-ancestor">
      Purchase drawer
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import Web3Module from '../../vuexModules/Web3Module'
import PurchaseModule from '../../vuexModules/PurchaseModule'

import Status from '@/components/ui/Status.vue'
import DrawerMessage from '@/components/ui/DrawerMessage.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'

const appVuexModule = 'appModule'

@Component
export default class PurchaseProcess extends Vue {

  // public created(this: PurchaseProcess) {
  //   this.$store.subscribe(this.vuexSubscriptions)
  // }

  public mounted(this: PurchaseProcess) {
    console.log('PurchaseProcess mounted')
  }
}
</script>
