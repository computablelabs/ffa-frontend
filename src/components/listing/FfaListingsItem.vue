<template>
  <div class="columns is-vcentered">
    <span class="column listing-property">{{ listing.title }}</span>
    <span class="column listing-property">{{ listing.description }}</span>
    <span class="column listing-property">{{ listing.file_type }}</span>
    <span class="column listing-property width-limited">{{ listing.listing_hash }}</span>
    <!-- <span class="column listing-property">{{ listing.md5 }}</span> -->
    <span class="column listing-property">{{ listing.tags }}</span>
    <span class="column listing-property" :data-status="listing.status">{{ listing.status }}</span>
    <!-- <span class="column listing-property" data-property="owner">{{ listing.owner }}</span> -->
    <!-- <span class="column listing-property">{{ listing.license }}</span> -->
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import FfaListing from '../../models/FfaListing'

@Component
export default class FfaListingsItem extends Vue {
  @Prop()
  public listing!: FfaListing

}
</script>