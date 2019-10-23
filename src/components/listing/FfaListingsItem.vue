<template>
  <div class="columns is-vcentered">
    <span class="column listing-property">{{ listing.title }}</span>
    <span class="column listing-property">{{ listing.description }}</span>
    <span class="column listing-property">{{ listing.fileType }}</span>
    <!-- scaffolding -->
    <span v-if="!!!this.status" class="column listing-property width-limited">{{ listing.hash }}</span>
    <span v-else class="column listing-property width-limited"><router-link :to="routerLink">{{ listing.hash }}</router-link></span>
    <!-- <span class="column listing-property">{{ listing.md5 }}</span> -->
    <span class="column listing-property">{{ listing.tags }}</span>
    <span class="column listing-property" :data-status="listing.status">{{ listing.status }}</span>
    <span class="column listing-property" data-property="owner">{{ listing.owner }}</span>
    <span class="column listing-property">{{ listing.license }}</span>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import FfaListing from '../../models/FfaListing'
import { FfaListingStatus } from '../../models/FfaListing'

@Component
export default class FfaListingsItem extends Vue {
  @Prop() public listing!: FfaListing
  @Prop() public status!: FfaListingStatus

  get routerLink(): string {
    switch (this.status) {
      case (FfaListingStatus.candidate):
        return `/listings/candidates/${this.listing.hash}`
      case (FfaListingStatus.listed):
        return `/listings/listed/${this.listing.hash}/purchase`
      default:
        return
    }
  }
}
</script>