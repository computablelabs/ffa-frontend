<template>
  <div class="support-withdraw-card">
    <h2>{{ title }}</h2>
    <div class="swc-message">
      Support the cooperative by exchanging Ether for the cooperative’s token, CMT
  </div>
    <EthereumToMarketToken />
    <div
      class="button"
      @click="onButtonClick">
      {{ buttonText }}
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import EthereumToMarketToken from './EthereumToMarketToken.vue'

import { Labels } from '../../util/Constants'

@Component({
  components: {
    EthereumToMarketToken,
  },
})
export default class SupportCooperative extends Vue {

  public title = Labels.SUPPORT_COOPERATIVE
  public buttonText = Labels.START_SUPPORT

  public onButtonClick() {
    this.$router.push('/support/support')
  }

}
</script>
