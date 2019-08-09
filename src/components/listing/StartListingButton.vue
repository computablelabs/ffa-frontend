<template>
  <div class="button-container">
    <button class="button" @click.prevent="startListing">Start Listing</button>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import ListModule from '../../vuexModules/ListModule'
import { getModule } from 'vuex-module-decorators'
import '@/assets/style/components/start-listing-button.sass'

export default class StartListingButton extends Vue {
    public startListing() {
      const listModule = getModule(ListModule, this.$store)
      listModule.setListingProcessing(true)
    }
  }
</script>