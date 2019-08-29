<template>
  <div class='tile is-vertical'>
    <div class='tile message is-hcentered'>
      Connecting to blockchain
    </div>
    <div class='tile is-hcentered'>
      <font-awesome-icon
        class="fa-spin"
        :icon="['fab', 'ethereum']"
        :class="svgColorClass"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class EthereumLoader extends Vue {}
</script>
