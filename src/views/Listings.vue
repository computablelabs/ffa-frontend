<template>
  <FfaListingsComponent
    :userAddress="userAddress"
    :status="status"/>
</template>

 <script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import '@/assets/style/components/listing.sass'
import FfaListingsComponent from '../../src/components/ui/FfaListingsComponent.vue'
import FfaListing, { FfaListingStatus } from '../models/FfaListing'

@Component({
  components: {
    FfaListingsComponent,
  },
})
 export default class Listings extends Vue {
  public userAddress?: string = ''
  public status?: FfaListingStatus = FfaListingStatus.listed
}
</script>