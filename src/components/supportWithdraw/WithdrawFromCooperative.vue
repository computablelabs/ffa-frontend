<template>
  <div class="withdraw-from-cooperative">
    <h2 class="title">{{ title }}</h2>
    <div class="message">
      Withdraw support from the cooperative
    </div>
    <MarketTokenToEthereum />
    <div
      class="button"
      @click="onButtonClick">
      {{ buttonText }}
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import MarketTokenToEthereum from './MarketTokenToEthereum.vue'

import { Labels } from '../../util/Constants'

@Component({
  components: {
    MarketTokenToEthereum,
  },
})
export default class WithdrawFromCooperative extends Vue {

  public title = Labels.WITHDRAW_FROM_COOPERATIVE
  public buttonText = Labels.START_WITHDRAWAL

  public onButtonClick() {
    this.$router.push('/support/withdraw')
  }
}
</script>
