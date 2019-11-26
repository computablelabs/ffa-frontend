<template>
  <div id="config">
   <h2>FFA {{ versionString }}</h2>
   <h3>Ethereum Network: {{ networkName }}</h3>
   <h3>Genesis Block: {{ genesisBlock }}</h3>
   <h3>JSON RPC Endpoint: {{ jsonRpcEndpoint }}</h3>
   <h3>Datatrust URL: {{ datatrustUrl }}</h3>
   <h3>Listing Batch Size: {{ batchSize }}</h3>
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

  public get genesisBlock(): string {
    return process.env.VUE_APP_GENESIS_BLOCK!
  }

  public get jsonRpcEndpoint(): string {
    return process.env.VUE_APP_ETHEREUM_JSON_RPC_PROVIDER!
  }

  public get datatrustUrl(): string {
    return Servers.Datatrust!
  }

  public get batchSize(): string {
    return process.env.VUE_APP_LISTING_BATCH_SIZE!
  }

}
</script>