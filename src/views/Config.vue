<template>
  <div id="config">
   <h2>FFA {{ versionString }}</h2>
   <h3>Ethereum Network: {{ networkName }}</h3>
   <h3>JSON RPC Endpoint: {{ jsonRpcEndpoint }}</h3>
   <h3>Datatrust URL: {{ datatrustUrl }}</h3>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Servers from '../util/Servers'

@Component
export default class Config extends Vue {

  public get versionString(): string {
    return 'v. 0.9 beta <- someone fix this'
  }

  public get networkName(): string {
    return process.env.VUE_APP_NETWORK_NAME!
  }

  public get jsonRpcEndpoint(): string {
    return process.env.VUE_APP_ETHEREUM_JSON_RPC_PROVIDER!
  }

  public get datatrustUrl(): string {
    // TODO: implement
    return Servers.Datatrust!
  }

}
</script>