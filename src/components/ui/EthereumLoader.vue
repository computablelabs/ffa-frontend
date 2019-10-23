<template>
  <div
    id='ethereum-loader'
    class='tile is-vertical'>
    <div class='tile message is-hcentered'>
      Connecting to blockchain
    </div>
    <div class='tile is-hcentered'>
      <!-- insert spinny icon here -->
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class EthereumLoader extends Vue {}
</script>
