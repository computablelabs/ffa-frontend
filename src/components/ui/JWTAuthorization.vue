<template>
  <div class="jwt-authorization">
    <a
      @click="onClick">
      Authorize Datatrust
    </a>
  </div>
</template>

<script lang="ts">
import {NoCache} from 'vue-class-decorator'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import AppModule from '../../vuexModules/AppModule'
import FlashesModule from '../../vuexModules/FlashesModule'

import { Eventable } from '../../interfaces/Eventable'

import Flash, {FlashType} from '../../models/Flash'

import MetamaskModule from '../../functionModules/metamask/MetamaskModule'
import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import uuid4 from 'uuid'
import Web3 from 'web3'
import Servers from '../../util/Servers'
@Component
export default class JWTAuthorization extends Vue {

  protected processId!: string
  protected message!: string
  protected signature!: string

  public created(this: JWTAuthorization) {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted(this: JWTAuthorization) {
    console.log('JWTAuthorization mounted')
  }

  public async vuexSubscriptions(mutation: MutationPayload) {

    if (mutation.type !== 'eventModule/append') {
      return
    }

    const event = mutation.payload as Eventable

    if (event.processId !== this.processId) {
      return
    }
    if (!!!event.response || !!!this.message) {
      return
    }

    this.signature = event.response.result
    const web3 = getModule(AppModule, this.$store).web3
    const checksumAddress = web3.utils.toChecksumAddress(ethereum.selectedAddress)
    const [error, jwt] = await DatatrustModule.authorize(this.message!, this.signature!, checksumAddress)
    const flashesModule = getModule(FlashesModule, this.$store)

    if (error) {
      return flashesModule.append(new Flash(error.message, FlashType.error))
    }

    if (jwt) {
      const appModule = getModule(AppModule, this.$store)
      appModule.setJWT(jwt!)
      return flashesModule.append(new Flash('Authorize successful.', FlashType.success))
    }
  }

  public onClick() {
    this.processId = uuid4()
    this.message = `timestamp: ${new Date().getTime()}`
    MetamaskModule.sign(this.message, this.processId, this.$store)
  }
}
</script>

