<template>
  <tr>
    <td class="icon-column" @click="onRowClicked">
      <FileIcon class="icon" :fileIconType="mimeTypeIcon" />
    </td>
    <td class="listing-title" @click="onRowClicked">{{ listing.title }}</td>
    <td class="description" @click="onRowClicked">{{ listing.description }}</td>
    <td align="right" class="jazzicon-cell" @click="onAddressClicked">
      <div class="address-container">
        <JazzIcon
          class="jazzicon"
          :address="listing.owner"
          :diameter="24"/>
        <div class="address">{{ ownerShortAddressString }}</div>
      </div>
    </td>
    <!-- <td data-property="owner" align="right" class="address">{{ ownerShortAddressString }}</td> -->
  </tr>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Location } from 'vue-router'

import FfaListing from '../../models/FfaListing'
import { FfaListingStatus } from '../../models/FfaListing'

import FileHelper from '../../util/FileHelper'

import FileIcon from '@/components/ui/FileIcon.vue'
import JazzIcon from '../ui/JazzIcon.vue'


@Component({
  components: {
    FileIcon,
    JazzIcon,
  },
})
export default class FfaListingsItem extends Vue {
  @Prop()
  public listing!: FfaListing

  @Prop()
  public status!: FfaListingStatus

  get ownerShortAddressString(): string {
    return `${this.listing.owner.substring(0, 7)}...`
  }

  get ownerAddress(): string {
    return this.listing.owner
  }

  public get mimeTypeIcon(): string {
    return FileHelper.mimeTypeIcon(this.listing.fileType)
  }

  get routerLink(): Location {
    switch (this.status) {
      case (FfaListingStatus.candidate):
        return {
          name: 'singleCandidate',
          params: {
            listingHash: this.listing.hash,
          },
        }
      case (FfaListingStatus.listed):
        return {
          name: 'singleListed',
          params: {
            listingHash: this.listing.hash,
          },
        }
      default:
        return {}
    }
  }

  public onRowClicked() {
    const statusString = this.status === FfaListingStatus.candidate ? 'candidates' : 'listed'
    window.location.href = `/listings/${statusString}/${this.listing.hash}`
  }

  public onAddressClicked() {
    window.location.href = `/users/${this.listing.owner}/listings/listed`
  }
}
</script>