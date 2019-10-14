<template>
  <div class="support-process-complete">
    <div class="checkcircle-container"></div>
    <span class="support-complete-label">
      {{ label }}
    </span>
    <EthereumToMarketToken
      :marketTokens="marketTokens"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import appStore from '../../store'
import AppModule from '../../vuexModules/AppModule'
import Web3Module from '../../vuexModules/Web3Module'

import EthereumToMarketToken from './EthereumToMarketToken.vue'

import { Labels } from '../../util/Constants'

@Component({
  components: {
    EthereumToMarketToken,
  },
})
export default class SupportProcessComplete extends Vue {

  @Prop()
  public marketTokens!: number

  public label = Labels.SUPPORT_COOPERATIVE

}

</script>
