<template>
  <div class="button-container">
    <button class="listing-button" @click.prevent="startListing">Start Listing</button>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import FlashesModule from '../../modules/FlashesModule'
  import { getModule } from 'vuex-module-decorators'
  import Flash from '../../models/Flash'
  import { FlashType } from '../../models/Flash'
  import '@/assets/style/components/start-listing-button.sass'
  import { Labels } from '../../util/Constants'

  export default Vue.extend({
    methods: {
      startListing() {
        const flashesModule = getModule(FlashesModule, this.$store)
        const flash = new Flash(Labels.START_LISTING, FlashType.info)
        flashesModule.append(flash)
      },
    },
  })
</script>