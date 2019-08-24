<template>
  <FfaTabbedListingsComponent />
</template>

 <script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import '@/assets/style/components/listing.sass'
import FfaTabbedListingsComponent from '../components/ui/FfaTabbedListingsComponent.vue'
import FfaListing, { FfaListingStatus } from '../models/FfaListing'

@Component({
  components: {
    FfaTabbedListingsComponent,
  },
})
 export default class Listings extends Vue {}
</script>