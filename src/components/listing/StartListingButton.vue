<template>
  <div class="button-container">
    <button class="button" @click.prevent="startListing">Start Listing</button>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import FlashesModule from '../../modules/FlashesModule'
import ListModule from '../../modules/ListModule'
import { getModule } from 'vuex-module-decorators'
import Flash from '../../models/Flash'
import { FlashType } from '../../models/Flash'
import '@/assets/style/components/start-listing-button.sass'
import { Labels } from '../../util/Constants'

export default class StartListingButton extends Vue {
    public startListing() {
      const flashesModule = getModule(FlashesModule, this.$store)
      const listModule = getModule(ListModule, this.$store)
      const flash = new Flash(Labels.START_LISTING, FlashType.info)
      flashesModule.append(flash)
      listModule.setListingProcessing(true)
    }
  }
</script>