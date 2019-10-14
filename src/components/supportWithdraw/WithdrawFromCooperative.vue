<template>
  <div class="withdraw-from-cooperative">
    <h2 class="title">{{ title }}</h2>
    <div class="message">
      Withdraw support from the cooperative
    </div>
    <EthereumToMarketToken />
    <div class="button">
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
export default class WithdrawFromCooperative extends Vue {

  public title = Labels.WITHDRAW_FROM_COOPERATIVE
  public buttonText = Labels.START_SUPPORT
}
</script>
