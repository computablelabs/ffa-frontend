<template>
  <div>
    <h1>{{ status }}</h1>
    <FfaTabbedListingsComponent
      :route="route"/>
  </div>
</template>

 <script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import '@/assets/style/components/listing.sass'
import FfaTabbedListingsComponent from '../components/ui/FfaTabbedListingsComponent.vue'
import { FfaListingStatus } from '../models/FfaListing'

@Component({
  components: {
    FfaTabbedListingsComponent,
  },
})
 export default class Listings extends Vue {

   @Prop()
   public route!: string

   @Prop()
   public status!: FfaListingStatus

   private mounted(this: Listings) {
     debugger
   }
 }
</script>