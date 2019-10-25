<template>
  <div class="support-drawer-wrapper">
    <SupportProcess />
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'
import DrawerModule from '../../vuexModules/DrawerModule'

import BaseDrawer from './BaseDrawer.vue'
import SupportProcess from '../../components/supportWithdraw/SupportProcess.vue'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Errors } from '../../util/Constants'

import { OpenDrawer, CloseDrawer } from '../../models/Events'

import '@/assets/style/components/list-drawer.sass'

@Component({
  components: {
    SupportProcess,
  },
})
export default class SupportDrawer extends BaseDrawer {
  public mounted(this: SupportDrawer) {
    console.log('SupportDrawer mounted')

    this.$nextTick(() => {
      this.$root.$emit(OpenDrawer)
      getModule(DrawerModule, this.$store).setDrawerCanClose(true)
    })
  }
}
</script>