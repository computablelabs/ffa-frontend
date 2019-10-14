<template>
  <section id="support">
    <div class="left-bar">
      <div class="top">
        <YourTokens />
      </div>
      <div class="middle">
        <SupportCooperative />
      </div>
      <div class="bottom">
        <WithdrawFromCooperative />
      </div>
    </div>
    <div class="market-token-chart-container">
      <image src="http://placekitten.com/640/640"/>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import YourTokens from '@/components/supportWithdraw/YourTokens.vue'
import SupportCooperative from '@/components/supportWithdraw/SupportCooperative.vue'
import WithdrawFromCooperative from '@/components/supportWithdraw/WithdrawFromCooperative.vue'

@Component({
  components: {
    YourTokens,
    SupportCooperative,
    WithdrawFromCooperative,
  },
})
export default class Support extends Vue {

}
</script>
