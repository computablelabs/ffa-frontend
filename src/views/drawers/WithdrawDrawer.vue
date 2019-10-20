<template>
  <div class="withdraw-drawer-wrapper">
    <div
      class="drawer-close"
      @click="onCloseClick">
      X
    </div>
    <WithdrawProcess />
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'

import BaseDrawer from './BaseDrawer.vue'
import WithdrawProcess from '../../components/supportWithdraw/WithdrawProcess.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'

import { OpenDrawer, CloseDrawer } from '../../models/Events'

import '@/assets/style/components/list-drawer.sass'

@Component({
  components: {
    WithdrawProcess,
  },
})
export default class WithdrawDrawer extends BaseDrawer {
  public mounted(this: WithdrawDrawer) {
    console.log('WithdrawDrawer mounted')

    this.$nextTick(() => {
      this.$root.$emit(OpenDrawer)
    })
  }

  public onCloseClick() {
    getModule(SupportWithdrawModule, this.$store).resetAll()
    this.$root.$emit(CloseDrawer)
    this.$router.replace('/support')
  }
}
</script>