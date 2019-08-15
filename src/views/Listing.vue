<template>
  <ListingIndex />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import '@/assets/style/components/listing.sass'
import ListingIndex from '../../src/components/ui/ListingIndex.vue'

@Component({
  components: {
    ListingIndex,
  }
})
export default class Listing extends Vue {}
</script>