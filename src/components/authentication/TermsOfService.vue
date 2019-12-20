<template>
  <div id="terms-of-service">
    <div class="terms-of-service-container">
      <h2>Beta Evaluation Terms of Service</h2>
      <Legal />
    </div>
    <section class="agreement-footer">
      <div class="agreement-footer-container">
        <label class="container">
          <input type="checkbox" v-model="checked">
          <span class="checkmark"></span>
          I am citizen or resident of the United States
        </label>

        <button 
          class="button is-primary is-medium"
          @click="onAgreeClicked"
          :disabled="!checked">
          I agree
        </button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { MutationPayload } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import uuid4 from 'uuid'

import DrawerBlockchainStep from '../../../src/components/ui/DrawerBlockchainStep.vue'

import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import MetamaskModule from '../../functionModules/metamask/MetamaskModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'
import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'

import AppModule from '../../vuexModules/AppModule'

import { Eventable } from '../../interfaces/Eventable'
import { Errors } from '../../util/Constants'

// @ts-ignore
import Legal from '../../assets/legal/TermsOfService.md'

import '@/assets/style/components/terms-of-service.sass'

@Component({
  components: {
    Legal,
  },
})
export default class TermsOfService extends Vue {
  public checked = false

  public onAgreeClicked() {
    // @ts-ignore
    this.$router.push(this.$route.query.redirectFrom)
  }
}
</script>
