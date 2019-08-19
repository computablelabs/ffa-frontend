<template>
  <tr>
    <td>{{ listing.title }}</td>
    <td>{{ listing.description }}</td>
    <td>{{ listing.type }}</td>
    <td>{{ listing.hash }}</td>
    <td>{{ listing.md5 }}</td>
    <td>{{ listing.tags }}</td>
    <td>{{ listing.status }}</td>
    <td>{{ listing.owner }}</td>
  </tr>
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