<template>
  <FfaListingComponent 
    :userAddress="userAddress"
    :displayCategory="displayCategory"/>
</template>

 <script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import '@/assets/style/components/listing.sass'
import FfaListingComponent from '../../src/components/ui/FfaListingComponent.vue'

@Component({
  components: {
    FfaListingComponent,
  },
})
 export default class Listing extends Vue {
  public userAddress: string = '0xwall3t'
  public displayCategory: string = ''
}
</script>