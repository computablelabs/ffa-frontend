<template>
  <FfaTabbedListingsComponent 
    :route="route"/>
</template>

 <script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import '@/assets/style/components/listing.sass'
import FfaTabbedListingsComponent from '../components/ui/FfaTabbedListingsComponent.vue'

@Component({
  components: {
    FfaTabbedListingsComponent,
  },
})
 export default class Listings extends Vue {
   @Prop()
   public route!: string
 }
</script>