<template>
  <FfaTabbedListingsComponent />
</template>

 <script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import '@/assets/style/components/listing.sass'
<<<<<<< HEAD
import FfaTabbedListingsComponent from '../components/ui/FfaTabbedListingsComponent.vue'
||||||| merged common ancestors
import FfaListingsComponent from '../../src/components/ui/FfaListingsComponent.vue'
import FfaListing, { FfaListingStatus } from '../models/FfaListing'
=======
import FfaTabbedListingsComponent from '../components/ui/FfaTabbedListingsComponent.vue'
import FfaListing, { FfaListingStatus } from '../models/FfaListing'
>>>>>>> 470d10ed7691237db154c491d4f33650e7854759

@Component({
  components: {
    FfaTabbedListingsComponent,
  },
})
 export default class Listings extends Vue {}
</script>