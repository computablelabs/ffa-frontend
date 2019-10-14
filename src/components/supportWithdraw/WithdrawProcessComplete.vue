<template>
  <div class="withdraw-process-complete">
    <div class="checkcircle-container"></div>
    <span class="withdraw-complete-label">
      {{ label }}
    </span>
    <MarketTokenToEthereum
      :marketTokens="marketTokens"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../store'
import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'

import MarketTokenToEthereum from './MarketTokenToEthereum.vue'

import { Labels } from '../../util/Constants'

@Component({
  components: {
    MarketTokenToEthereum,
  },
})
export default class SupportProcessComplete extends Vue {

  @Prop()
  public marketTokens!: number

  public label = Labels.WITHDRAW_FROM_COOPERATIVE

}

</script>
