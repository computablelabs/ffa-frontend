<template>
  <div class="columns">
    <span class="column listing-property">{{ listing.title }}</span>
    <span class="column listing-property">{{ listing.description }}</span>
    <span class="column listing-property">{{ listing.type }}</span>
    <span class="column listing-property">{{ listing.hash }}</span>
    <span class="column listing-property">{{ listing.md5 }}</span>
    <span class="column listing-property">{{ listing.tags }}</span>
    <span class="column listing-property">{{ listing.status }}</span>
    <span class="column listing-property">{{ listing.owner }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import FfaListing from '../../models/FfaListing'

@Component
export default class FfaListingItem extends Vue {
  @Prop()
  public listing!: FfaListing
}
</script>