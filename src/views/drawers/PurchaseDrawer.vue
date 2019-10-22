<template>
  <div id="purchase-drawer">
    <div
      class="drawer-close"
      @click="onCloseClick">
      X
    </div>
    <PurchaseProcess
      listing="listing"
    />
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

import PurchaseProcess from '@/components/purchase/PurchaseProcess.vue'
import PurchaseButtons from '@/components/purchase/PurchaseButtons.vue'
import BaseDrawer from './BaseDrawer.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'
import { CloseDrawer } from '../../models/Events'
import FfaListing from '../../models/FfaListing'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'

import '@/assets/style/components/list-drawer.sass'

const appVuexModule = 'appModule'

@Component({
  components: {
    PurchaseProcess,
    PurchaseButtons,
  },
})
export default class PurchaseDrawer extends BaseDrawer {

  @Prop()
  public listingHash?: string

  protected appModule = getModule(AppModule, this.$store)
  protected purchaseModule = getModule(PurchaseModule, this.$store)
  protected ffaListingsModule = getModule(FfaListingsModule, this.$store)

  @NoCache
  public get hasError(): boolean {
    return !this.appModule.appReady || this.listing === undefined
  }

  @NoCache
  public get errorMessage(): string {
    if (!this.appModule.appReady) {
      return Errors.METAMASK_NOT_CONNECTED
    } else if (this.listing === undefined) {
      return Errors.INVALID_LISTING_HASH
    } else {
      return Errors.UNKNOWN_ERROR
    }
  }

  @NoCache
  public get isExecuting(): boolean {
    return this.purchaseModule.status === ProcessStatus.Executing
  }

  @NoCache
  get listing(): FfaListing|undefined {
    if (this.listingHash === undefined) {
      return undefined
    }
    return this.ffaListingsModule.listed.find((l) => l.hash === this.listingHash)
  }

  public mounted(this: PurchaseDrawer) {
    console.log('PurchaseDrawer mounted')
  }

  public onCloseClick() {
    this.$root.$emit(CloseDrawer)
    // this.$router.go(-1)
  }
}
</script>