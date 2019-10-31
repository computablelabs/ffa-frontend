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
import DrawerModule from '../../vuexModules/DrawerModule'

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
    getModule(DrawerModule, this.$store).setDrawerOpenClass('open300')

    this.$nextTick(() => {
      this.$root.$emit(OpenDrawer)
      getModule(DrawerModule, this.$store).setDrawerCanClose(true)
    })
    console.log('WithdrawDrawer mounted')
  }

  public onCloseClick() {
    getModule(SupportWithdrawModule, this.$store).resetAll()
    this.$root.$emit(CloseDrawer)
    this.$router.replace('/support')
  }
}
</script>