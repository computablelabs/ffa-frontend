<template>
  <div class="purchase-buttons tile">
    <a class="button" @click="onActionClick">{{ actionButtonText }}</a>
    <a class="button">{{ challengeButtonText }}</a>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import AppModule from '../../vuexModules/AppModule'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'

import { ProcessStatus } from '../../models/ProcessStatus'

import PurchaseProcess from '@/components/purchase/PurchaseProcess.vue'
import StartProcessButton from '@/components/ui/StartProcessButton.vue'
import BaseDrawer from './BaseDrawer.vue'

import { Labels } from '../../util/Constants'

@Component
export default class PurchaseButtons extends Vue {

  public purchaseModule = getModule(PurchaseModule, this.$store)

  @NoCache
  public get actionButtonText(): string {
    switch (this.purchaseModule.status) {
      case ProcessStatus.Complete:
        return Labels.DOWNLOAD
      default:
        return Labels.PURCHASE
    }
  }

  public get challengeButtonText(): string {
    return Labels.CHALLENGE
  }

  public onActionClick() {
    this.purchaseModule.setStatus(ProcessStatus.Executing)
  }
}
</script>