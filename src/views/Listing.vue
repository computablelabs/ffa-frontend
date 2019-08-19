<template>
  <FfaListingComponent
    :userAddress="userAddress"
    :status="status"/>
</template>

 <script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import '@/assets/style/components/listing.sass'
import FfaListingComponent from '../../src/components/ui/FfaListingComponent.vue'
import FfaListing, { FfaListingStatus } from '../models/FfaListing'

@Component({
  components: {
    FfaListingComponent,
  },
})
 export default class Listing extends Vue {
  public userAddress?: string = undefined
  public status?: FfaListingStatus = undefined
}
</script>